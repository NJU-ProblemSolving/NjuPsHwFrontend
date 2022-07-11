REPO_ROOT="$(git rev-parse --absolute-git-dir)/../deployment"

test "$revision" || revision="$(git describe --tags 2> /dev/null)" || true
test "$revision" || revision="$(git describe --tags --always 2> /dev/null)" || true
test "$revision" || revision="$(git log -1 --pretty=format:\"git-%cd-%h\" --date=short 2> /dev/null)"

test "$version" || version="$(cat "$REPO_ROOT/VERSION" 2> /dev/null)"
test "$version" || version=$revision

echo "$version"
