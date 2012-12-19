scriptdir="/usr/share/doc/openvpn/examples/easy-rsa/2.0/"
vars="./vars"
clean="./clean-all"
cascript="./build-ca"

cd $scriptdir
. $vars
$clean
$cascript