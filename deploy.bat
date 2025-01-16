@echo off
echo DEPLOYMENT PROCEDURE
echo:
echo The deployment consists of the following steps:
echo  - Attempt to move on the develop branch
echo  - Add and commit all changes to the develop branch
echo  - Push repo to azure remote with remote build
echo  - Synchronize the main branch with the develop branch
echo:

setlocal
:prompt
set /P CONFIRMATION=do you want to perform deployment? (y/[n])? 
if /I "%CONFIRMATION%" neq "y" goto end
echo:

echo ======== Deployment ========
echo:

call git checkout develop
call git add --all
if %1.==. (
    call git commit -m "Azure Deploy %date% %time%"
) else (
   call git commit -m "Azure Deploy %date% %time%" -m %1
)
call git push origin -u develop
echo === committed changes
echo:

echo === pushing remote, performing deployment...
call git push azure develop:main
echo === repository deployed to remote
echo:

echo ======== Synchronization ========
echo:

echo === syncing branches...
call git rebase develop main
call git push origin -u main
call git checkout develop
echo === develop and main branches synchronized

:end
endlocal