param(
    [int]$BackendPort = 8080,
    [int]$FrontendPort = 5173,
    [switch]$SkipBuild,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerDir = Join-Path $RootDir "server"
$FrontendDir = Join-Path $RootDir "frontend"
$RunDir = Join-Path $RootDir ".codex-run"
$BackendJar = Join-Path $ServerDir "target\dorm-repair-server-0.0.1-SNAPSHOT.jar"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Resolve-RequiredCommand {
    param([string[]]$Names)

    foreach ($name in $Names) {
        $command = Get-Command $name -ErrorAction SilentlyContinue
        if ($command) {
            return $command.Source
        }
    }

    throw "Missing required command: $($Names -join ' or ')"
}

function Stop-PortProcess {
    param([int]$Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    $processIds = $connections |
        Where-Object { $_.OwningProcess -and $_.OwningProcess -ne 0 } |
        Select-Object -ExpandProperty OwningProcess -Unique

    if (-not $processIds) {
        Write-Host "Port $Port is free."
        return
    }

    foreach ($processId in $processIds) {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Killing process $processId ($($process.ProcessName)) on port $Port..."
            Stop-Process -Id $processId -Force
        }
    }

    $deadline = (Get-Date).AddSeconds(10)
    do {
        Start-Sleep -Milliseconds 300
        $stillUsed = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    } while ($stillUsed -and (Get-Date) -lt $deadline)

    if ($stillUsed) {
        throw "Port $Port is still in use after killing existing process."
    }
}

function Start-LoggedProcess {
    param(
        [string]$FilePath,
        [string[]]$ArgumentList,
        [string]$WorkingDirectory,
        [string]$StdoutPath,
        [string]$StderrPath
    )

    return Start-Process `
        -FilePath $FilePath `
        -ArgumentList $ArgumentList `
        -WorkingDirectory $WorkingDirectory `
        -RedirectStandardOutput $StdoutPath `
        -RedirectStandardError $StderrPath `
        -WindowStyle Hidden `
        -PassThru
}

function Wait-Port {
    param(
        [int]$Port,
        [string]$Name,
        [int]$TimeoutSeconds = 40
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if ($connection) {
            Write-Host "$Name is listening on port $Port."
            return
        }
        Start-Sleep -Seconds 1
    } while ((Get-Date) -lt $deadline)

    throw "$Name did not start listening on port $Port within $TimeoutSeconds seconds."
}

function Get-PortOwnerProcessId {
    param([int]$Port)

    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1

    if ($connection) {
        return [int]$connection.OwningProcess
    }

    return $null
}

New-Item -ItemType Directory -Force -Path $RunDir | Out-Null

$Java = Resolve-RequiredCommand @("java.exe", "java")
$Maven = Resolve-RequiredCommand @("mvn.cmd", "mvn")
$Npm = Resolve-RequiredCommand @("npm.cmd", "npm")

$BackendOut = Join-Path $RunDir "backend.out.log"
$BackendErr = Join-Path $RunDir "backend.err.log"
$FrontendOut = Join-Path $RunDir "frontend.out.log"
$FrontendErr = Join-Path $RunDir "frontend.err.log"
$StateFile = Join-Path $RunDir "start-all.json"

Write-Step "Stopping processes on ports $BackendPort and $FrontendPort"
Stop-PortProcess $BackendPort
Stop-PortProcess $FrontendPort

if (-not $SkipBuild) {
    Write-Step "Packaging backend"
    Push-Location $ServerDir
    try {
        & $Maven package -DskipTests
        if ($LASTEXITCODE -ne 0) {
            throw "Backend package failed with exit code $LASTEXITCODE."
        }
    } finally {
        Pop-Location
    }
}

if (-not (Test-Path $BackendJar)) {
    throw "Backend jar not found: $BackendJar"
}

Write-Step "Starting backend"
Remove-Item -LiteralPath $BackendOut, $BackendErr -ErrorAction SilentlyContinue
$Backend = Start-LoggedProcess `
    -FilePath $Java `
    -ArgumentList @("-jar", $BackendJar, "--server.port=$BackendPort") `
    -WorkingDirectory $ServerDir `
    -StdoutPath $BackendOut `
    -StderrPath $BackendErr

Write-Step "Starting frontend"
Remove-Item -LiteralPath $FrontendOut, $FrontendErr -ErrorAction SilentlyContinue
$Frontend = Start-LoggedProcess `
    -FilePath $Npm `
    -ArgumentList @("run", "dev", "--", "--host", "127.0.0.1", "--port", "$FrontendPort", "--strictPort") `
    -WorkingDirectory $FrontendDir `
    -StdoutPath $FrontendOut `
    -StderrPath $FrontendErr

Write-Step "Checking ports"
Wait-Port -Port $BackendPort -Name "Backend" -TimeoutSeconds 60
Wait-Port -Port $FrontendPort -Name "Frontend" -TimeoutSeconds 30

$BackendPortPid = Get-PortOwnerProcessId $BackendPort
$FrontendPortPid = Get-PortOwnerProcessId $FrontendPort

$state = [ordered]@{
    backendPid = $BackendPortPid
    frontendPid = $FrontendPortPid
    backendLauncherPid = $Backend.Id
    frontendLauncherPid = $Frontend.Id
    backendUrl = "http://127.0.0.1:$BackendPort"
    frontendUrl = "http://127.0.0.1:$FrontendPort/"
    backendHealthUrl = "http://127.0.0.1:$BackendPort/api/health"
    swaggerUrl = "http://127.0.0.1:$BackendPort/swagger-ui.html"
    backendLog = $BackendOut
    backendErrorLog = $BackendErr
    frontendLog = $FrontendOut
    frontendErrorLog = $FrontendErr
    startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
}

$state | ConvertTo-Json | Set-Content -Path $StateFile -Encoding UTF8

Write-Step "Started"
Write-Host "Frontend:      $($state.frontendUrl)" -ForegroundColor Green
Write-Host "Backend:       $($state.backendUrl)" -ForegroundColor Green
Write-Host "Health check:  $($state.backendHealthUrl)" -ForegroundColor Green
Write-Host "Swagger:       $($state.swaggerUrl)" -ForegroundColor Green
Write-Host "Backend PID:   $($state.backendPid)"
Write-Host "Frontend PID:  $($state.frontendPid)"
Write-Host "Logs:          $RunDir"

if (-not $NoBrowser) {
    Start-Process $state.frontendUrl | Out-Null
}
