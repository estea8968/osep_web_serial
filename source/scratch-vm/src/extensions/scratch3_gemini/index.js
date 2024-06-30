const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');

//async add estea
const ml5 = require('ml5');
//require('babel-polyfill');
//end
const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = '';
//const { Configuration, OpenAIApi } = require('openai');

const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB3aWR0aD0iNDkuNjE2MTczbW0iCiAgIGhlaWdodD0iNTMuNTI1NjA4bW0iCiAgIHZpZXdCb3g9IjAgMCA0OS42MTYxNzMgNTMuNTI1NjA4IgogICB2ZXJzaW9uPSIxLjEiCiAgIGlkPSJzdmc4IgogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkyLjUgKDIwNjBlYzFmOWYsIDIwMjAtMDQtMDgpIgogICBzb2RpcG9kaTpkb2NuYW1lPSJvcGVuYWktc21hbGwuc3ZnIj4KICA8ZGVmcwogICAgIGlkPSJkZWZzMiIgLz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMC40ODQyMTQ0MyIKICAgICBpbmtzY2FwZTpjeD0iLTE5Ny4yMTQ3MiIKICAgICBpbmtzY2FwZTpjeT0iLTY1Ljg0MzIzNSIKICAgICBpbmtzY2FwZTpkb2N1bWVudC11bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ibGF5ZXIxIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE4NTYiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iMTAxNiIKICAgICBpbmtzY2FwZTp3aW5kb3cteD0iNjQiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9IjI3IgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiCiAgICAgZml0LW1hcmdpbi10b3A9IjAiCiAgICAgZml0LW1hcmdpbi1sZWZ0PSIwIgogICAgIGZpdC1tYXJnaW4tcmlnaHQ9IjAiCiAgICAgZml0LW1hcmdpbi1ib3R0b209IjAiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICBpbmtzY2FwZTpsYWJlbD0i5ZyW5bGkIDEiCiAgICAgaW5rc2NhcGU6Z3JvdXBtb2RlPSJsYXllciIKICAgICBpZD0ibGF5ZXIxIgogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKC02OC4zNTg1OSwtNjguMzk5NDUpIj4KICAgIDxnCiAgICAgICBpZD0iZzkxMiIKICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM0My4xNTAzMSwtMTAyLjE4MDExKSI+CiAgICAgIDxwYXRoCiAgICAgICAgIHNvZGlwb2RpOm5vZGV0eXBlcz0iY2NjY2NjY3NjY2NjY2NjY3NjY3Njc2Nzc2NjY2Nzc3NjY3NzY3Nzc2NjY3NjY2Njc3NjY2Njc2NjY2NjY2NjIgogICAgICAgICBzdHlsZT0iZmlsbDojNjA5OGY0O3N0cm9rZS13aWR0aDowLjM1Mjc3Nzc4IgogICAgICAgICBkPSJtIC0yNTQuNjcxNDIsMjIyLjQ2NTkzIGMgLTAuNjA0NTksLTAuOTgyNTcgLTIuMDYzMDQsLTIuNjQ1MDEgLTMuMjQxLC0zLjY5NDMxIGwgLTIuMTQxNzYsLTEuOTA3ODIgNC4wMjI0MywwLjA0MjMgYyA0LjgzNDg5LDAuMDUwOCA2Ljg3MjU1LC0wLjM5MjE4IDExLjA3Nzk5LC0yLjQwODU5IDMuNDY1NDcsLTEuNjYxNjIgNi44MjUyNiwtNC40MjExMSA4Ljc0MDMsLTcuMTc4NjcgMC45ODQyMywtMS40MTcyMyAxLjE1MjMxLC0xLjUzMzYxIDEuMjQ3NjMsLTAuODYzOCAwLjEzNzkxLDAuOTY5MTEgLTEuMjUwMSw0LjQ0NjI3IC0yLjgwNzI4LDcuMDMyNjcgLTIuOTIzMDEsNC44NTQ5OCAtOS4yNDk2Niw5LjM5Njg0IC0xNC42NjQ4NiwxMC41Mjc4MyAtMS4wNzA5NywwLjIyMzY4IC0xLjE5NTUsMC4xMzcyNyAtMi4yMzM0NSwtMS41NDk2MiB6IG0gLTUuODA0NTcsLTYuNjAyMzkgYyAtNC4xNTEzNSwtMC42MzU4MiAtOS4zMTEzNSwtMy4xMDkwOSAtMTIuMzExMjUsLTUuOTAwOTcgbCAtMi4wMDQ0OCwtMS44NjU0OSAxLjA0NjM3LC0yLjIxMjU3IGMgMC41NzU1MSwtMS4yMTY5IDEuMjMxMiwtMy4zMDgzNCAxLjQ1NzEsLTQuNjQ3NjQgMC4yMjU5MSwtMS4zMzkzIDAuNTE1NDUsLTIuNDM1MDUgMC42NDM0NCwtMi40MzUgMC4xMjgsNWUtNSAwLjc0NzMyLDEuMDcxNjEgMS4zNzYyOSwyLjM4MTI1IDMuNDEyOSw3LjEwNjM5IDEwLjM5MTQxLDExLjkwMjMxIDE4Ljg3NjU2LDEyLjk3MjczIDAuOTIxNjMsMC4xMTYyNyAxLjY3NTcsMC4zNDE1NyAxLjY3NTcsMC41MDA2NyAwLDAuODA1MDcgLTcuNzI1NjMsMS42NzE3MyAtMTAuNzU5NzMsMS4yMDcwMiB6IG0gMjIuNzU0MTcsLTAuMzc0OTIgYyAwLC0wLjE3NzA5IDAuNDA5NTksLTAuODY4NzYgMC45MTAyMSwtMS41MzcwNSA0Ljc4MzY0LC02LjM4NTg0IDUuNzIzODIsLTE1Ljg2Nzg4IDIuMzE4MTIsLTIzLjM3ODk5IC0xLjI2ODA1LC0yLjc5NjYyIC0wLjgyOTQ4LC0zLjA5OTc0IDEuMjM2ODIsLTAuODU0ODIgMy4wODYxMSwzLjM1Mjg5IDQuNzc5NDEsNi40NTg1NSA1Ljc2NjY2LDEwLjU3NjU4IDAuNzg2MDIsMy4yNzg2NCAwLjg5MzA2LDYuNzE0MzEgMC4zMTI5OSwxMC4wNDUzNiAtMC40ODMxMiwyLjc3NDI3IC0wLjk1MjI4LDMuMjc2MTYgLTMuMDczNDcsMy4yODc4NiAtMS4zOTY4NSwwLjAwOCAtNC40ODEzOCwwLjg2Nzk2IC02Ljg1Mzk3LDEuOTExNTEgLTAuMzM5NTUsMC4xNDkzNSAtMC42MTczNiwwLjEyNjY1IC0wLjYxNzM2LC0wLjA1MDQgeiBtIC0yOC44Njg1OSwtMTAuNzMwODQgYyAtNC44NjI4OSwtNS4wNzE0NyAtNy4yMjE5OSwtMTIuNzUxOTkgLTYuMDU5NDYsLTE5LjcyNzc1IDAuNTk5MDYsLTMuNTk0NjMgMC43Nzk2MSwtMy44NjYyNyAyLjU3MzEsLTMuODcxMzIgMS44NzQxNiwtMC4wMDUgNC41NjM5NywtMC43MTYxMiA2LjU0ODE3LC0xLjczMDUxIDAuODQzNDEsLTAuNDMxMTggMS42MDY1OSwtMC43MTA4NiAxLjY5NTk0LC0wLjYyMTUxIDAuMDg5MywwLjA4OTMgLTAuNTYwMjQsMS4yNDAwMyAtMS40NDM1MiwyLjU1NzA3IC00LjU1MjU5LDYuNzg4MTcgLTUuMjc4MDQsMTUuMjk3MTQgLTEuOTMzMTUsMjIuNjc0MTQgMC41NjYwNSwxLjI0ODQgMS4wMjkxOCwyLjMyNzIzIDEuMDI5MTgsMi4zOTc0MSAwLDAuNTEwNDcgLTAuOTM4NzIsLTAuMTQyODcgLTIuNDEwMjYsLTEuNjc3NTMgeiBtIDM2Ljk3MzEsLTExLjQ4NTAzIGMgLTMuMTUxOTUsLTYuNTExOTIgLTkuNjM2MjEsLTExLjE4Mjk0IC0xNy4yMzE5NSwtMTIuNDEzMjYgLTEuOTY0NDksLTAuMzE4MTkgLTMuNTcxOTcsLTAuNjkxNDggLTMuNTcyMTcsLTAuODI5NTIgLTAuMDAxLC0wLjY3ODIzIDMuMzMyNjcsLTEuMTU5MDkgNy45MzcxMSwtMS4xNDQ4NyA0LjUzMzA5LDAuMDE0IDUuMTU2MjgsMC4wOTY5IDcuNTg0NzIsMS4wMDgyNSAxLjQ1NTIxLDAuNTQ2MTQgMy4yMDE0NiwxLjMyMTg1IDMuODgwNTYsMS43MjM3OSAyLjEyNDIsMS4yNTcyNSA1LjU5NzI2LDQuMTMzIDUuODEzMjIsNC44MTM0NSAwLjExMzYyLDAuMzU4IC0wLjEwMjYxLDEuMTg0NTQgLTAuNDgwNTMsMS44MzY3NSAtMC45NTU1MSwxLjY0OTA0IC0xLjgwNDkxLDQuNzI3NTEgLTEuODA0OTEsNi41NDE1MyAwLDAuODM3OTEgLTAuMTQ1MTUsMS41MjM0NyAtMC4zMjI1NiwxLjUyMzQ3IC0wLjE3NzQxLDAgLTAuOTg4OTgsLTEuMzc2ODEgLTEuODAzNDksLTMuMDU5NTkgeiBtIC0zNS4wODg2OCwtNS44NDgwNSBjIDAuNDE2MjYsLTIuMDI0MTYgMi45MDE5OCwtNi43MzAxNiA0LjY0OTk2LC04LjgwMzM3IDEuNzUwMjksLTIuMDc1OTYgNC4yNTE1LC00LjE3Njg3IDYuNTI3NjksLTUuNDgzMDEgMS41NjE5MSwtMC44OTYyNiA2LjA3MzA2LC0yLjU1ODc2IDYuOTQzMTQsLTIuNTU4NzYgMC4zNDc4OSwwIDAuOTQ3MzIsMC41ODAxIDEuMzY2OTksMS4zMjI5MiAwLjg3NDkyLDEuNTQ4NTcgMi41NDEyNiwzLjM3NTkxIDQuNDMzOTcsNC44NjIzOCBsIDEuMzQ3MywxLjA1ODExIC00LjUyMjMsLTAuMDA2IGMgLTQuMDQ3MTUsLTAuMDA1IC00Ljg1MDUyLDAuMTAxODQgLTcuNjQ2MSwxLjAxODExIC00Ljc5NTUxLDEuNTcxNzQgLTkuNjA2NjYsNS4wODIwNyAtMTIuMDI2LDguNzc0NDUgLTAuODU4MSwxLjMwOTYyIC0xLjM2NDExLDEuMjIyNDYgLTEuMDc0NjUsLTAuMTg1MDkgeiIKICAgICAgICAgaWQ9InBhdGg4OTciCiAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIHNvZGlwb2RpOm5vZGV0eXBlcz0iY2NjY2NzY2NzY3NjY3NjY2NjY3NzY2Nzc2Nzc3NjY2NzY2NjY3NzYyIKICAgICAgICAgc3R5bGU9ImZpbGw6I2Y5YmUyMTtzdHJva2Utd2lkdGg6MC4zNTI3Nzc3OCIKICAgICAgICAgZD0ibSAtMjYwLjQ3NTk5LDIxNS44NjM1NCBjIC00LjE1MTM1LC0wLjYzNTgyIC05LjMxMTM1LC0zLjEwOTA5IC0xMi4zMTEyNSwtNS45MDA5NyBsIC0yLjAwNDQ4LC0xLjg2NTQ5IDEuMDQ2MzcsLTIuMjEyNTcgYyAwLjU3NTUxLC0xLjIxNjkgMS4yMzEyLC0zLjMwODM0IDEuNDU3MTEsLTQuNjQ3NjQgMC4yMjU5LC0xLjMzOTMgMC41MTU0NCwtMi40MzUwNSAwLjY0MzQzLC0yLjQzNSAwLjEyOCw1ZS01IDAuNzQ3MzIsMS4wNzE2MSAxLjM3NjI5LDIuMzgxMjUgMy40MTI5LDcuMTA2MzkgMTAuMzkxNDEsMTEuOTAyMzEgMTguODc2NTYsMTIuOTcyNzMgMC45MjE2MywwLjExNjI3IDEuNjc1NywwLjM0MTU3IDEuNjc1NywwLjUwMDY3IDAsMC44MDUwNyAtNy43MjU2MywxLjY3MTczIC0xMC43NTk3MywxLjIwNzAyIHogbSAyMy4xMDY5NSwtMC42ODIyMiBjIDAsLTAuMTEwNTYgMC40NTQ1MiwtMC44NjQ2MiAxLjAxMDA1LC0xLjY3NTY5IDQuMjY4NzMsLTYuMjMyMyA1LjI4NDY5LC0xNC4zODQ0NyAyLjY1ODkzLC0yMS4zMzU1OSAtMS40NDMwNiwtMy44MjAxNiAtMS40MDA3LC0zLjkyNzIzIDAuNjkzMTIsLTEuNzUxOTkgNC4wMjI5Niw0LjE3OTQgNi4wMTQzOSw5LjQ1MTQ5IDUuOTY1MTQsMTUuNzkyMDcgLTAuMDE2MSwyLjA2NTk0IC0wLjI0MzkzLDQuNDAwMTkgLTAuNTE1MjQsNS4yNzc5NCBsIC0wLjQ4NjQ3LDEuNTczNzcgLTIuODM1MjcsMC40Mzk5NyBjIC0xLjU1OTQsMC4yNDE5OSAtMy41OTE0MiwwLjc2NDEgLTQuNTE1NjIsMS4xNjAyNiAtMS44MjI5OSwwLjc4MTQyIC0xLjk3NDY0LDAuODIxMyAtMS45NzQ2NCwwLjUxOTI2IHogbSAtMjkuMjIxMzcsLTEwLjQyMzU0IGMgLTQuODYyODksLTUuMDcxNDcgLTcuMjIxOTksLTEyLjc1MTk5IC02LjA1OTQ2LC0xOS43Mjc3NSAwLjU5OTA2LC0zLjU5NDYzIDAuNzc5NjEsLTMuODY2MjcgMi41NzMxLC0zLjg3MTMyIDEuODc0MTYsLTAuMDA1IDQuNTYzOTcsLTAuNzE2MTIgNi41NDgxNywtMS43MzA1MSAwLjg0MzQxLC0wLjQzMTE4IDEuNjA2NTksLTAuNzEwODYgMS42OTU5NCwtMC42MjE1MSAwLjA4OTMsMC4wODkzIC0wLjU2MDI0LDEuMjQwMDMgLTEuNDQzNTIsMi41NTcwNyAtNC41NTI1OSw2Ljc4ODE3IC01LjI3ODA0LDE1LjI5NzE0IC0xLjkzMzE1LDIyLjY3NDE0IDAuNTY2MDUsMS4yNDg0IDEuMDI5MTgsMi4zMjcyMyAxLjAyOTE4LDIuMzk3NDEgMCwwLjUxMDQ3IC0wLjkzODcyLC0wLjE0Mjg3IC0yLjQxMDI2LC0xLjY3NzUzIHogbSAzNi45NzMxLC0xMS40ODUwMyBjIC0zLjE1MTk1LC02LjUxMTkyIC05LjYzNjIxLC0xMS4xODI5NCAtMTcuMjMxOTUsLTEyLjQxMzI2IC0xLjk2NDQ5LC0wLjMxODE5IC0zLjU3MTk3LC0wLjY5MTQ4IC0zLjU3MjE3LC0wLjgyOTUyIC0wLjAwMSwtMC42NzgyMyAzLjMzMjY3LC0xLjE1OTA5IDcuOTM3MTEsLTEuMTQ0ODcgNC41MzMwOSwwLjAxNCA1LjE1NjI4LDAuMDk2OSA3LjU4NDcyLDEuMDA4MjUgMS40NTUyMSwwLjU0NjE0IDMuMjAxNDYsMS4zMjE4NSAzLjg4MDU2LDEuNzIzNzkgMi4xMjQyLDEuMjU3MjUgNS41OTcyNiw0LjEzMyA1LjgxMzIyLDQuODEzNDUgMC4xMTM2MiwwLjM1OCAtMC4xMDI2MSwxLjE4NDU0IC0wLjQ4MDUzLDEuODM2NzUgLTAuOTU1NTEsMS42NDkwNCAtMS44MDQ5MSw0LjcyNzUxIC0xLjgwNDkxLDYuNTQxNTMgMCwwLjgzNzkxIC0wLjE0NTE1LDEuNTIzNDcgLTAuMzIyNTYsMS41MjM0NyAtMC4xNzc0MSwwIC0wLjk4ODk4LC0xLjM3NjgxIC0xLjgwMzQ5LC0zLjA1OTU5IHoiCiAgICAgICAgIGlkPSJwYXRoODk1IgogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPgogICAgICA8cGF0aAogICAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9InNjY3NjY2NjY3NzY2Nzc2Nzc3NjY2NzY2NjY3NzYyIKICAgICAgICAgc3R5bGU9ImZpbGw6I2VjNjM1NztzdHJva2Utd2lkdGg6MC4zNTI3Nzc3OCIKICAgICAgICAgZD0ibSAtMjM3LjM2OTA0LDIxNS4xODEzMiBjIDAsLTAuMTEwNTYgMC40NTQ1MiwtMC44NjQ2MiAxLjAxMDA1LC0xLjY3NTY5IDQuMjY4NzMsLTYuMjMyMyA1LjI4NDY5LC0xNC4zODQ0NyAyLjY1ODkzLC0yMS4zMzU1OSAtMS40NDMwNiwtMy44MjAxNiAtMS40MDA3LC0zLjkyNzIzIDAuNjkzMTIsLTEuNzUxOTkgNC4wMjI5Niw0LjE3OTQgNi4wMTQzOSw5LjQ1MTQ5IDUuOTY1MTQsMTUuNzkyMDcgLTAuMDE2MSwyLjA2NTk0IC0wLjI0MzkzLDQuNDAwMTkgLTAuNTE1MjQsNS4yNzc5NCBsIC0wLjQ4NjQ3LDEuNTczNzcgLTIuODM1MjcsMC40Mzk5NyBjIC0xLjU1OTQsMC4yNDE5OSAtMy41OTE0MiwwLjc2NDEgLTQuNTE1NjIsMS4xNjAyNiAtMS44MjI5OSwwLjc4MTQyIC0xLjk3NDY0LDAuODIxMyAtMS45NzQ2NCwwLjUxOTI2IHogbSAtMjkuMjIxMzcsLTEwLjQyMzU0IGMgLTQuODYyODksLTUuMDcxNDcgLTcuMjIxOTksLTEyLjc1MTk5IC02LjA1OTQ2LC0xOS43Mjc3NSAwLjU5OTA2LC0zLjU5NDYzIDAuNzc5NjEsLTMuODY2MjcgMi41NzMxLC0zLjg3MTMyIDEuODc0MTYsLTAuMDA1IDQuNTYzOTcsLTAuNzE2MTIgNi41NDgxNywtMS43MzA1MSAwLjg0MzQxLC0wLjQzMTE4IDEuNjA2NTksLTAuNzEwODYgMS42OTU5NCwtMC42MjE1MSAwLjA4OTMsMC4wODkzIC0wLjU2MDI0LDEuMjQwMDMgLTEuNDQzNTIsMi41NTcwNyAtNC41NTI1OSw2Ljc4ODE3IC01LjI3ODA0LDE1LjI5NzE0IC0xLjkzMzE1LDIyLjY3NDE0IDAuNTY2MDUsMS4yNDg0IDEuMDI5MTgsMi4zMjcyMyAxLjAyOTE4LDIuMzk3NDEgMCwwLjUxMDQ3IC0wLjkzODcyLC0wLjE0Mjg3IC0yLjQxMDI2LC0xLjY3NzUzIHogbSAzNi45NzMxLC0xMS40ODUwMyBjIC0zLjE1MTk1LC02LjUxMTkyIC05LjYzNjIxLC0xMS4xODI5NCAtMTcuMjMxOTUsLTEyLjQxMzI2IC0xLjk2NDQ5LC0wLjMxODE5IC0zLjU3MTk3LC0wLjY5MTQ4IC0zLjU3MjE3LC0wLjgyOTUyIC0wLjAwMSwtMC42NzgyMyAzLjMzMjY3LC0xLjE1OTA5IDcuOTM3MTEsLTEuMTQ0ODcgNC41MzMwOSwwLjAxNCA1LjE1NjI4LDAuMDk2OSA3LjU4NDcyLDEuMDA4MjUgMS40NTUyMSwwLjU0NjE0IDMuMjAxNDYsMS4zMjE4NSAzLjg4MDU2LDEuNzIzNzkgMi4xMjQyLDEuMjU3MjUgNS41OTcyNiw0LjEzMyA1LjgxMzIyLDQuODEzNDUgMC4xMTM2MiwwLjM1OCAtMC4xMDI2MSwxLjE4NDU0IC0wLjQ4MDUzLDEuODM2NzUgLTAuOTU1NTEsMS42NDkwNCAtMS44MDQ5MSw0LjcyNzUxIC0xLjgwNDkxLDYuNTQxNTMgMCwwLjgzNzkxIC0wLjE0NTE1LDEuNTIzNDcgLTAuMzIyNTYsMS41MjM0NyAtMC4xNzc0MSwwIC0wLjk4ODk4LC0xLjM3NjgxIC0xLjgwMzQ5LC0zLjA1OTU5IHoiCiAgICAgICAgIGlkPSJwYXRoODkzIgogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPgogICAgICA8cGF0aAogICAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9InNjY3NjY2NjY3NjY2NjY3NzY2NjY3NjY2NjY2NjY2MiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNlODQxMzM7c3Ryb2tlLXdpZHRoOjAuMzUyNzc3NzgiCiAgICAgICAgIGQ9Im0gLTIzNy4zNjkwNCwyMTUuMTgxMzIgYyAwLC0wLjExMDU2IDAuNDU0NTIsLTAuODY0NjIgMS4wMTAwNSwtMS42NzU2OSA0LjI2ODczLC02LjIzMjMgNS4yODQ2OSwtMTQuMzg0NDcgMi42NTg5MywtMjEuMzM1NTkgLTEuNDQzMDYsLTMuODIwMTYgLTEuNDAwNywtMy45MjcyMyAwLjY5MzEyLC0xLjc1MTk5IDQuMDIyOTYsNC4xNzk0IDYuMDE0MzksOS40NTE0OSA1Ljk2NTE0LDE1Ljc5MjA3IC0wLjAxNjEsMi4wNjU5NCAtMC4yNDM5Myw0LjQwMDE5IC0wLjUxNTI0LDUuMjc3OTQgbCAtMC40ODY0NywxLjU3Mzc3IC0yLjgzNTI3LDAuNDM5OTcgYyAtMS41NTk0LDAuMjQxOTkgLTMuNTkxNDIsMC43NjQxIC00LjUxNTYyLDEuMTYwMjYgLTEuODIyOTksMC43ODE0MiAtMS45NzQ2NCwwLjgyMTMgLTEuOTc0NjQsMC41MTkyNiB6IG0gLTMwLjE1NjgsLTEyLjM4NjYxIGMgLTMuODg3MzksLTUuMDg5OTMgLTUuNTk4NDUsLTEyLjU4NjQ5IC00LjI5MzIxLC0xOC44MDk1OSBsIDAuNDA2OTUsLTEuOTQwMjggMi4xMTY2NywtMC4yNjIyMiBjIDEuMTY0MTcsLTAuMTQ0MjMgMi44MTk2MywtMC41MDE0MiAzLjY3ODgyLC0wLjc5Mzc1IDAuODU5MTgsLTAuMjkyMzQgMS42ODEwNCwtMC41MzE1MyAxLjgyNjM0LC0wLjUzMTUzIDAuMTQ1MzEsMCAtMC4yNzM0OSwwLjg5MjkyIC0wLjkzMDY2LDEuOTg0MjYgLTMuMzMzNDQsNS41MzU3MyAtNC4xMjE3MSwxMi43NjAxIC0yLjA5MDI3LDE5LjE1NzEzIDAuNDYxMjQsMS40NTI0NyAwLjc4MTI1LDIuNjk4MjMgMC43MTExMiwyLjc2ODM1IC0wLjA3MDEsMC4wNzAxIC0wLjcxMTcyLC0wLjYzNzQ0IC0xLjQyNTc2LC0xLjU3MjM3IHogbSAzOC4xMTIxLC0xMC42MDgzNSBjIC0wLjYzODUsLTEuMjQ0MiAtMi4yMDYsLTMuMTk0MDggLTQuMDU2OTUsLTUuMDQ2NiAtMy41MTg4NiwtMy41MjE4NCAtNy4xMDc3MywtNS41ODQzNyAtMTEuNTM2MjksLTYuNjI5OTQgLTIuMjUwOTMsLTAuNTMxNDMgLTIuNjExOTEsLTAuNzAzNjggLTEuOTI5MzQsLTAuOTIwNjMgMS41MzQzOSwtMC40ODc2OCA3LjUzNDYsLTAuMjg1MjkgOS45MTQwMywwLjMzNDQxIDMuNzY1OTUsMC45ODA4MiA4LjEzNjc1LDMuNDEwODYgMTAuMzYzNzQsNS43NjE5NyBsIDEuMDA5MTEsMS4wNjUzNCAtMC45MTkxNiwxLjk0MjkzIGMgLTAuNTA1NTMsMS4wNjg2MSAtMS4wOTE4NCwyLjc0ODE5IC0xLjMwMjkyLDMuNzMyMzggLTAuMjExMDcsMC45ODQyIC0wLjQxMDMsMS43ODkwOCAtMC40NDI3MywxLjc4ODYyIC0wLjAzMjQsLTMuNmUtNCAtMC41MjcyLC0wLjkxMzI3IC0xLjA5OTQ5LC0yLjAyODQ4IHoiCiAgICAgICAgIGlkPSJwYXRoODkxIgogICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPgogICAgICA8cGF0aAogICAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9InNjY3NjY2NjY3MiCiAgICAgICAgIHN0eWxlPSJmaWxsOiMzYWFhNTg7c3Ryb2tlLXdpZHRoOjAuMzUyNzc3NzgiCiAgICAgICAgIGQ9Im0gLTIzNy4zNjkwNCwyMTUuMTgxMzIgYyAwLC0wLjExMDU2IDAuNDU0NTIsLTAuODY0NjIgMS4wMTAwNSwtMS42NzU2OSA0LjI2ODczLC02LjIzMjMgNS4yODQ2OSwtMTQuMzg0NDcgMi42NTg5MywtMjEuMzM1NTkgLTEuNDQzMDYsLTMuODIwMTYgLTEuNDAwNywtMy45MjcyMyAwLjY5MzEyLC0xLjc1MTk5IDQuMDIyOTYsNC4xNzk0IDYuMDE0MzksOS40NTE0OSA1Ljk2NTE0LDE1Ljc5MjA3IC0wLjAxNjEsMi4wNjU5NCAtMC4yNDM5Myw0LjQwMDE5IC0wLjUxNTI0LDUuMjc3OTQgbCAtMC40ODY0NywxLjU3Mzc3IC0yLjgzNTI3LDAuNDM5OTcgYyAtMS41NTk0LDAuMjQxOTkgLTMuNTkxNDIsMC43NjQxIC00LjUxNTYyLDEuMTYwMjYgLTEuODIyOTksMC43ODE0MiAtMS45NzQ2NCwwLjgyMTMgLTEuOTc0NjQsMC41MTkyNiB6IgogICAgICAgICBpZD0icGF0aDg4OSIKICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=';
const blockIconURI = menuIconURI;
let theLocale = null;
let ai_user='一般人';
let ai_assistant='簡單回答問題';
let ai_question='';
let ai_model='gemini-pro';
//this.prompt='';
let ai_temperature=0.5;
let max_tokens=500;
let ai_top_p=0.9;  //>0 <1
let ai_frequency_penalty=0.8; //>0.1 <0.9
let ai_presence_penalty=0.5;  //>0 <1         

class scratch3_gemini {
    constructor(runtime) {
        theLocale = this._setLocale();
        this.runtime = runtime;
        this.api_key =genAI;
        this.ai_answer = '';
        this.image_size_ary=['1024x1024','512x512','256x256'];
        //this.runtime.registerPeripheralExtension('openai', this);

 
    }

    _setLocale() {
        let nowLocale = '';
        switch (formatMessage.setup().locale) {
            case 'zh-tw':
                nowLocale = 'zh-tw';
                break;
            default:
                nowLocale = 'en';
                break;
        }
        return nowLocale;
    }

    getInfo() {
        theLocale = this._setLocale();
        return {
            id: 'gemini',
            name: 'Gemini',
            color1: '#0000CD',
            color2: '#0000CD',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'openai_apikey',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'api key'
                        },
                    },
                    text: msg.openai_apikey[theLocale]
                },
                /*{
                    opcode: 'drawimage',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                        NUM: {
                            type: ArgumentType.STRING,
                            menu:'num13',
                            defaultValue: '1'
                        },
                        SIZE: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.size[theLocale][1],
                            menu:'sizeItem'
                        },
                    },
                    text: msg.drawimage[theLocale]
                },
                
                '---',
                {
                    opcode: 'set_ai_modle',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MODLE: {
                            type: ArgumentType.STRING,
                            menu:'modleItem',
                            defaultValue: 'gpt-4'
                        },
                    },
                    text: msg.set_ai_modle[theLocale]
                },
                {
                    opcode: 'set_ai_user',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        USER: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                    },
                    text: msg.set_ai_user[theLocale]
                },*/
                {
                    opcode: 'set_max_token',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TOKEN: {
                            type: ArgumentType.STRING,
                            defaultValue: '2048'
                        },
                    },
                    text: msg.set_max_token[theLocale]
                },                
                {
                    opcode: 'set_temperature',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEMP: {
                            type: ArgumentType.STRING,
                            defaultValue: '0.5'
                        },
                    },
                    text: msg.set_temperature[theLocale]
                },
                /*{
                    opcode: 'set_assistant',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ASSISTANT: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                    },
                    text: msg.set_assistant[theLocale]
                },*/
                {
                    opcode: 'do_question',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        QUESTION:{
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                    },
                    text: msg.set_question[theLocale]
                },
                '---',
                {
                    opcode: 'aianswer',
                    blockType: BlockType.REPORTER,
                    text: msg.ananswer[theLocale],
                    arguments: {
                        id: {
                            type: ArgumentType.STRING,
                            defaultValue: 'id'
                        }
                    },
                },
                {
                    opcode: 'copyTEXT_memory',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                    },
                    text: msg.copyTEXT_memory[theLocale]
                },
                
            ],
            menus: {
                sizeItem: {
                    acceptReporters: true,
                    items: msg.size[theLocale],
                },
                num13:{
                    acceptReporters: true,
                    items: ['1','2','3'],
                },
                /*modleItem:{
                    acceptReporters: true,
                    items: ['gpt-3.5-turbo','gpt-4'],
                },*/
            }
        };
    }

    openai_apikey(args){
        this.api_key = args.KEY;
    }

    set_ai_modle(args){
        ai_model =args.MODLE;
        console.log('ai_modle=',ai_model);
    }
    set_max_token(args){
        max_tokens=parseInt(args.TOKEN,10);
        if(max_tokens<2048){
            max_tokens=2048;
        }
        console.log('max_tokens=',max_tokens);
    }
    set_temperature(args){
        ai_temperature=parseFloat(args.TEMP);
        if(ai_temperature<0){
            ai_temperature=0;
        } 
        if(ai_temperature>1){
            ai_temperature=1;
        }
        console.log('temperature=',ai_temperature);
    }
    async drawimage(args){
        let image_size = args.SIZE;
        let n_num = parseInt(args.NUM,10);
        if(n_num<1){
            n_num=1;
        }
        if(n_num>3){
            n_num = 3;
        }
        for(var i=0;i<this.image_size_ary.length;i++){
            if(image_size==msg.size[theLocale][i]){
                image_size = this.image_size_ary[i];
                break;
            }
        }
        const prompt_text = args.TEXT;
        
        if(this.api_key=='' ||  this.api_key=='api key'){
            alert('api_key is null');
        }
        const configuration = new Configuration({
            apiKey: this.api_key,
            //apiKey: process.env.OPENAI_API_KEY,
          });
        let openai_draw = new OpenAIApi(configuration);
        //console.log('openai_draw=',openai_draw);
        console.log('prompt_text=',prompt_text,image_size);
        try{
            const draw_respone = await openai_draw.createImage({
                model: "dall-e-2",
                prompt:prompt_text,
                n:n_num,
                size: image_size
            })
          //const  image_url = draw_respone.data.data[0].url
          const  image_url = draw_respone.data.data  
          console.log('response.data=',draw_respone.data);
          const w_size = image_size.split('x');
          for(n=0;n<draw_respone.data.data.length;n++){
            window.open(image_url[n].url, 'gemini 生圖功能'+n, 'width=' + w_size[0] + ', height=' + w_size[1] + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');
          }
          
          
        }catch (error) {
            if (error.response) {
              console.log(error.draw_respone.status);
              console.log(error.draw_respone.data);
              alert(error.draw_respone.data);
            } else {
                //console.log('response=',draw_respone);
              console.log(error.message);
              alert(error.message);
            }
        }  
    }
      
    set_ai_user(args){
        ai_user = args.USER;
    }

    set_assistant(args){
        ai_assistant = args.ASSISTANT;
    }

    async do_question(args){
        ai_question = args.QUESTION;
        console.log('ai_question=',ai_question+ai_assistant);
        if(this.api_key=='' || this.api_key=='api key' || ai_question==''){
            this.ai_answer= msg.error_ai[theLocale];//'api_key system assistant user can not empty';
        }else{
            //const genAI = new GoogleGenerativeAI(process.env.API_KEY);
            //console.log('api_key=',this.api_key);
            genAI = new GoogleGenerativeAI(this.api_key);
            console.log('genAI=',genAI);
            const generationConfig = {
                stopSequences: ["red"],
                maxOutputTokens: max_tokens,
                temperature: ai_temperature,  //0.9,
                topP: ai_top_p,  //0.1,
                topK: 16,
              };
            //const model = genAI.getGenerativeModel({ model: "gemini-pro",generationConfig});
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest",generationConfig});
                 //const prompt = "Write a story about a magic backpack."
            const result = await model.generateContent(ai_question);
            this.ai_answer = await result.response.text();
            //console.log('response=',response.text());
            //this.ai_answer = response.text();
            console.log('ai_answer=',this.ai_answer);        
        }
    }

    aianswer(){
        return this.ai_answer;
    }

    copyTEXT_memory(args){
        const copy_text = args.TEXT;
        navigator.clipboard.writeText(copy_text).then(function() {
            console.log('Async: Copying to clipboard was successful!');
          }, function(err) {
            alert(err);
            console.error('Async: Could not copy text: ', err);
          });

    }
      
    /**/
}

module.exports = scratch3_gemini;
