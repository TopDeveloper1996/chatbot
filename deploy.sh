#!/bin/bash


increment_version() {
    # Extract the current version from package.json using grep and awk
    VERSION=$(grep '"version":' package.json | awk -F '"' '{print $4}')
    
    # Split the version into major, minor, and patch
    IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"

    # Increment the patch version by 1
    PATCH=$((PATCH + 1))

    # Construct the new version
    NEW_VERSION="$MAJOR.$MINOR.$PATCH"

    # Use sed to update the version in package.json
    sed -i.bak "s/\"version\": \"$VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json

    echo "Updated version to $NEW_VERSION"
}

echo "DEPLOYMENT PROCEDURE"
echo
echo "The deployment consists of the following steps:"
echo "  - Attempt to move on the develop branch"
echo "  - Add and commit all changes to the develop branch"
echo "  - Push repo to azure remote with remote build"
echo "  - Synchronize the main branch with the develop branch"
echo

read -p "Do you want to perform deployment? (y/[n])? " CONFIRMATION
if [[ "$CONFIRMATION" != "y" ]]; then
    exit 0
fi
echo

echo "======== Deployment ========"
echo

git fetch origin
git checkout develop
git rebase origin/develop --autostash --force


# Increment the version number in package.json
increment_version


git add --all
if [ -z "$1" ]; then
    git commit -m "Azure Deploy $(date)"
else
    git commit -m "Azure Deploy $(date)" -m "$1"
fi
git push origin develop
echo "=== committed changes"
echo

echo "=== pushing remote, performing deployment..."
git push azure develop:main
echo "=== repository deployed to remote"
echo

echo "======== Synchronization ========"
echo

echo "=== syncing branches..."
git checkout main
git rebase develop
git push origin main
git checkout develop
echo "=== develop and main branches synchronized"
