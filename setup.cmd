@echo off
setlocal enabledelayedexpansion

if exist ".env" (
    echo .env file exists. ✅
) else (
    echo .env file does not exist.
    copy .env.example .env >nul
)

for /d %%D in (apps\* packages\*) do (
    if exist "%%D" (
        set "target=%%D\.env"

        if not exist "!target!" (
            mklink "!target!" "%cd%\.env"
        )
    )
)