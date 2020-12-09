# Get the deployed git revision to display in the footer
module Git
  REVISION = `SHA1=$(git rev-parse --short HEAD 2> /dev/null); if [ $SHA1 ]; then echo $SHA1; else cat REVISION; fi`.chomp
  VERSION = `VERSION=$(echo '' 2> /dev/null); if [ $VERSION ]; then echo $VERSION; else cat VERSION; fi`.chomp
end