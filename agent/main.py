import asyncio
import argparse
import json
from typing import Optional, Dict, Callable, Awaitable, List, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
import uvicorn

from app.agent.manus import Manus
from app.logger import logger
from app.schema import Message, AgentState
from app.tool.browser_use_tool import BrowserUseTool
from app.tool.str_replace_editor import StrReplaceEditor
from app.tool.terminate import Terminate
from app.tool.web_search import WebSearch

app = FastAPI(title="OpenManus API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

active_connections: Dict[str, WebSocket] = {}
event_queues: Dict[str, asyncio.Queue] = {}
agent_tasks: Dict[str, asyncio.Task] = {}

# async def sse_step_callback(client_id: str, step_num: int, step_result: str, state: AgentState):
#     """SSE step callback that immediately pushes events to the queue"""
#     if client_id in event_queues:
#         message = {
#             "type": "step_update",
#             "step": step_num,
#             "result": step_result,
#             "state": state.value
#         }
#         try:
#             await event_queues[client_id].put(message)
#             logger.info(f"Step {step_num} queued for client {client_id}")
#         except Exception as e:
#             logger.error(f"Error queuing step update: {e}")
#     else:
#         logger.warning(f"No queue found for client {client_id} in step callback")
#     return None

# FINISHED
async def sse_browser_callback(client_id: str, state_data: dict):
    """SSE browser callback that immediately pushes events to the queue"""
    if client_id in event_queues:
        message = {
            "type": "browser_state_update",
            "data": state_data,
            "message": "Browser tool was used"
        }
        try:
            await event_queues[client_id].put(message)
        except Exception as e:
            logger.error(f"Error queuing browser update: {e}")
    else:
        logger.warning(f"No queue found for client {client_id} in browser callback")
    return None

async def sse_editor_callback(client_id: str, state_data: dict):
    """SSE editor callback that immediately pushes events to the queue"""
    if client_id in event_queues:
        try:
            message = {
                "type": "editor_state_update",
                "data": state_data,
            }
            await event_queues[client_id].put(message)
            logger.info(f"Editor update queued for client {client_id}: {state_data.get('path', 'unknown path')}")
        except Exception as e:
            logger.error(f"Error queuing editor update: {e}")
    else:
        logger.warning(f"No queue found for client {client_id} in editor callback")
    return None

async def sse_tool_callback(client_id: str, tool_name: str, tool_data: dict):
    """Generic SSE tool callback that pushes tool-specific events to the queue"""
    if client_id in event_queues:
        message = {
            "type": "tool_update",
            "tool": tool_name,
            "data": tool_data
        }
        try:
            await event_queues[client_id].put(message)
            logger.info(f"Tool update for {tool_name} queued for client {client_id}")
        except Exception as e:
            logger.error(f"Error queuing tool update: {e}")
    else:
        logger.warning(f"No queue found for client {client_id} in tool callback")
    return None

async def sse_agent_thought_callback(client_id: str, thought: str):
    """SSE agent thought callback that immediately pushes events to the queue"""
    if client_id in event_queues:
        message = {
            "type": "agent_thought",
            "message": thought
        }
        try:
            await event_queues[client_id].put(message)
            logger.info(f"Agent thought queued for client {client_id}")
        except Exception as e:
            logger.error(f"Error queuing agent thought: {e}")
    else:
        logger.warning(f"No queue found for client {client_id} in agent thought callback")
    return None

async def sse_base_run_callback(client_id: str, step_num: int, message: str):
    """SSE base run callback that immediately pushes events to the queue"""
    if client_id in event_queues:
        message = {
            "type": "base_run",
            "step": step_num,
            "message": message
        }
        try:
            await event_queues[client_id].put(message)
            logger.info(f"Base run event queued for client {client_id}")
        except Exception as e:
            logger.error(f"Error queuing base run event: {e}")
    else:
        logger.warning(f"No queue found for client {client_id} in base run callback")
    return None

@app.get("/sse/{client_id}")
async def sse_endpoint(client_id: str, request: Request):
    """SSE endpoint for streaming agent responses"""
    # Create a queue for this client
    event_queues[client_id] = asyncio.Queue()
    logger.info(f"New SSE connection for client {client_id}")

    async def event_generator():
        try:
            content = request.query_params.get("content", "")
            if not content:
                logger.error("No content provided")
                yield {
                    "event": "message",
                    "data": json.dumps({"type": "error", "content": "No content provided"})
                }
                return

            # Initialize agent
            agent = Manus()

            # Set up the SSE callbacks
            # async def step_callback_wrapper(step_num: int, step_result: str, state: AgentState):
            #     logger.info(f"Step {step_num}: {step_result} (state: {state.value})")
            #     return await sse_step_callback(client_id, step_num, step_result, state)

            async def agent_thought_callback_wrapper(thought: str):
                logger.info(f"Agent thought: {thought}")
                return await sse_agent_thought_callback(client_id, thought)

            async def base_run_callback_wrapper(step_num: int, message: str):
                logger.info(f"Base run step {step_num}: {message}")
                return await sse_base_run_callback(client_id, step_num, message)

            # agent.step_callback = step_callback_wrapper
            agent.thought_callback = agent_thought_callback_wrapper
            agent.base_run_callback = base_run_callback_wrapper

            # Set up tool callbacks for all available tools
            for tool_name, tool in agent.available_tools.tool_map.items():
                if isinstance(tool, BrowserUseTool):
                    async def browser_callback_wrapper(state_data: dict):
                        return await sse_browser_callback(client_id, state_data)
                    tool.ws_callback = browser_callback_wrapper
                elif isinstance(tool, StrReplaceEditor):
                    async def editor_callback_wrapper(state_data: dict):
                        return await sse_editor_callback(client_id, state_data)
                    tool.ws_callback = editor_callback_wrapper

                tool_name_capture = tool_name  # Capture the tool name for the closure
                async def tool_callback_wrapper(data: dict):
                    logger.info(f"Tool update for {tool_name_capture}: {str(data)[:100]}...")
                    return await sse_tool_callback(client_id, tool_name_capture, data)

                # Set the callback on the tool if it has a callback attribute
                if hasattr(tool, 'ws_callback'):
                    # For BrowserUseTool and StrReplaceEditor, we keep the specific callback
                    if not isinstance(tool, (BrowserUseTool, StrReplaceEditor)):
                        tool.ws_callback = tool_callback_wrapper
                elif hasattr(tool, 'callback'):
                    tool.callback = tool_callback_wrapper

            # Send start message
            start_message = {
                "type": "execution_started",
                "content": "Mission started"
            }
            logger.info(f"Starting mission for client {client_id}")
            yield {
                "event": "message",
                "data": json.dumps(start_message)
            }
            # Give the client time to process the start message
            await asyncio.sleep(0.2)

            # Start agent run in a separate task
            agent_task = asyncio.create_task(agent.run(request=content))
            # Store the task in the global dictionary
            agent_tasks[client_id] = agent_task

            # Stream events from the queue while the agent is running
            while True:
                # Use wait_for with a timeout to periodically check if agent is done
                try:
                    # Smaller timeout for more responsive streaming
                    event = await asyncio.wait_for(event_queues[client_id].get(), timeout=0.05)
                    logger.info(f"Sending event to client {client_id}: {event['type']}")

                    # Send the event
                    yield {
                        "event": "message",
                        "data": json.dumps(event)
                    }
                    # Small delay to ensure events are processed in order
                    await asyncio.sleep(0.05)
                    event_queues[client_id].task_done()
                except asyncio.TimeoutError:
                    # Check if agent task is done
                    if agent_task.done():
                        # Get the agent response
                        try:
                            response = await agent_task
                            logger.info(f"Agent task completed for client {client_id}")
                        except Exception as e:
                            logger.error(f"Error in agent task: {e}")
                            response = f"Error: {str(e)}"
                        break
                    # Otherwise, continue waiting for events
                    continue
                except Exception as e:
                    logger.error(f"Error getting event from queue: {e}")
                    yield {
                        "event": "message",
                        "data": json.dumps({
                            "type": "error",
                            "content": f"Error getting event: {str(e)}"
                        })
                    }
                    break

            # Send completion message
            completion_message = {
                "type": "execution_completed",
                "content": response if response else "No response"
            }
            logger.info(f"Mission completed for client {client_id}")

            # Give a small delay before sending completion
            await asyncio.sleep(0.2)
            yield {
                "event": "message",
                "data": json.dumps(completion_message)
            }

            # Send done event - small delay to ensure other messages are processed
            await asyncio.sleep(0.2)
            logger.info(f"Sending DONE signal for client {client_id}")
            yield {"event": "done", "data": ""}

            # Clean up
            if client_id in event_queues:
                del event_queues[client_id]
                logger.info(f"Cleaned up queue for client {client_id}")

            # Remove the task reference
            if client_id in agent_tasks:
                del agent_tasks[client_id]
                logger.info(f"Cleaned up task for client {client_id}")

        except Exception as e:
            logger.error(f"Error in SSE stream: {e}")
            yield {
                "event": "message",
                "data": json.dumps({"type": "error", "content": str(e)})
            }
            await asyncio.sleep(0.1)
            yield {"event": "done", "data": ""}

            if client_id in event_queues:
                del event_queues[client_id]
                logger.info(f"Cleaned up queue for client {client_id} after error")

            if client_id in agent_tasks:
                del agent_tasks[client_id]
                logger.info(f"Cleaned up task for client {client_id} after error")

    return EventSourceResponse(event_generator())

@app.post("/api/chat")
async def chat_endpoint(message: dict):
    """HTTP API endpoint for chat"""
    agent = Manus()
    response = await agent.run(request=message["content"])
    return {
        "response": response if response else "No response"
    }

@app.post("/api/execute")
async def execute_endpoint(code: dict):
    """HTTP API endpoint for code execution"""
    agent = Manus()
    try:
        result = await agent.available_tools.get_tool("python_execute").execute(
            code=code["code"]
        )
        return {"result": result.output}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/stop/{client_id}")
async def stop_execution(client_id: str):
    """Stop an ongoing agent execution"""
    if client_id in agent_tasks and not agent_tasks[client_id].done():
        # Cancel the task
        agent_tasks[client_id].cancel()
        try:
            # Wait for it to be cancelled
            await asyncio.wait_for(agent_tasks[client_id], timeout=2.0)
        except (asyncio.CancelledError, asyncio.TimeoutError):
            pass

        # Send termination event if the queue exists
        if client_id in event_queues:
            await event_queues[client_id].put({
                "type": "execution_terminated",
                "content": "Execution was stopped by user"
            })

        return {"status": "stopped", "message": "Agent execution stopped"}
    return {"status": "not_found", "message": "No running agent task found for this client"}

async def cli_mode():
    """CLI mode implementation"""
    agent = Manus()
    try:
        prompt = input("Enter your prompt: ")
        if not prompt.strip():
            logger.warning("Empty prompt provided.")
            return

        logger.warning("Processing your request...")
        await agent.run(prompt)
        logger.info("Request processing completed.")
    except KeyboardInterrupt:
        logger.warning("Operation interrupted.")

def main():
    parser = argparse.ArgumentParser(description="OpenManus - AI Agent Platform")
    parser.add_argument(
        "--mode",
        choices=["cli", "api"],
        default="cli",
        help="Run mode: cli (default) or api"
    )
    parser.add_argument(
        "--host",
        default="0.0.0.0",
        help="Host to bind the API server (default: 0.0.0.0)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to bind the API server (default: 8000)"
    )

    args = parser.parse_args()

    if args.mode == "cli":
        asyncio.run(cli_mode())
    else:
        uvicorn.run(app, host=args.host, port=args.port)

if __name__ == "__main__":
    main()
