scriptdir="/usr/share/doc/openvpn/examples/easy-rsa/2.0/"
vars="./vars"
bks="./$1 $2"

cd $scriptdir
. $vars
$bks
