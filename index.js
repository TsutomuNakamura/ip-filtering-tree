
exports.IPDict = function() {

    /** Instance of myself */
    const myself = this;

    /** 0 of 32bit unsigned integer */
    const INT32_0 = ~~0;

    /** IPv4 subnet masks */
    const iPv4NetMasks = (function () {
        var masks   = new Array(32 + 1);
        var mask    = ~~0xffffffff;
        var bit     = 0;

        for(var i = 32; i >= 0; --i) {
            masks[i] = mask;
            mask <<= 1;
        }
        return masks;
    })();

    var iPv4Dict = {};
    iPv4Dict[0] = [         /* Network address */
        undefined,          /* Data */
        0,                  /* Length of subnetmask */
        true,               /* Is glue node? */
        [undefined, {}]     /* Next node ['Length of child subnetmask', 'child nodes map'] */
    ];

    /** Index of data on IPv4 dictionary  */
    const I_IPV4_DATA                       = 0;
    /** Index of length of subnetmask on IPv4 dictionary */
    const I_IPV4_LENGTH_OF_SUBNETMASK       = 1;
    /** Index of is glue node */
    const I_IPV4_IS_GLUE_NODE               = 2;
    /** Index of reference of child node */
    const I_IPV4_CHILD_ELEMENTS             = 3;

    /** Index of subnet mask length in child node */
    const I_CHILD_SUBNET_LENGTH             = 0;
    /** Index of child nodes */
    const I_CHILD_NODES                     = 1;

    /**
     * Remove a data in database indexed by IPv4 network address.
     * @param {string} IPv4  address string for index
     * @param {number} len   Length of network address for IPv4 address
     */
    this.removeDataForIPv4 = function(iPv4, len) {
        // TODO:
        myself.removeDataToIPv4Tree(iPv4Dict[0], undefined, myself.iPv4StringToBinary(iPv4), len);
    }

    this.removeDataToIPv4Tree = function(node, pNode, ip, length) {
        var currentNode = node;
        var parentNode  = pNode;
        var subnetLengthOfCurrentNode = currentNode[I_IPV4_LENGTH_OF_SUBNETMASK];
        var result = node[I_IPV4_DATA];
        var netAddr = undefined;

        while(true) {

            if(currentNode[I_IPV4_LENGTH_OF_SUBNETMASK] === length) {
                if(currentNode[I_IPV4_IS_GLUE_NODE]) {
                    return undefined;
                } else {
                    // remove and return the data
                    // TODO:
                    result = currentNode[I_IPV4_DATA];
                    if(Object.keys(parentNode[I_IPV4_REF_CHILD_NODE]).length === 1) {
                        var map = currentNode[I_IPV4_REF_CHILD_NODE];
                        var childSubnetLength = currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK];
                        // 
                    } else {
                    
                    }
                    return result;
                }
            } else if(currentNode[I_IPV4_LENGTH_OF_SUBNETMASK] > length) {
                // newver existed
                return undefined;
            }

            // has child?
            // if(currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]) {
            if(currentNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_SUBNET_LENGTH]) {
                netAddr = myself.getBinIPv4NetAddr(ip, currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]);
                if(currentNode[I_IPV4_REF_CHILD_NODE][netAddr]) {
                    parentNode = currentNode;
                    currentNode = parentNode[I_IPV4_REF_CHILD_NODE][netAddr];
                    // continue;
                }
            } else {
                return undefined;
            }
        }
    }

    this.hasGlueNodeOnly = function(node) {
        console.log("TODO: ");
    }

    this.find = function(keyIP) {
        var ip              = myself.iPv4StringToBinary(keyIP, 32);
        var netAddr         = undefined;    /* should 0.0.0.0 at first time */
        var currentNode     = iPv4Dict[0];
        var nextNode        = undefined;
        var result          = currentNode[I_IPV4_DATA];

        while(currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]) {
            netAddr = myself.getBinIPv4NetAddr(ip, currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]);
            if(nextNode = currentNode[I_IPV4_REF_CHILD_NODE][netAddr]) {
                // found data node or glue node
                if(!nextNode[I_IPV4_IS_GLUE_NODE]) {
                    result = nextNode[I_IPV4_DATA];
                }
                currentNode = nextNode;
            } else {
                return result;
            }
        }
        return result;
    }

    /**
     * Push a data in database indexed by IPv4 network address.
     * @param {string} IPv4  IPv4 address string for index
     * @param {number} len   Length of network address for IPv4 address
     * @param {object} data  Data for push
     */
    this.pushDataForIPv4 = function(iPv4, len, data) {
        myself.pushDataToIPv4Tree(iPv4Dict[0], myself.iPv4StringToBinary(iPv4), len, data);
    }

    /**
     * Push data into IPv4 indexed tree.
     * @param {object} node Current node of IPv4 indexed tree.
     * @param {number} binIPv4 Binary IPv4 network address not as string.
     */
    this.pushDataToIPv4Tree = function(node, binaryIPv4, subnetLength, data) {

        var currentNode = undefined;
        var nextNode    = node;
        currentNode     = nextNode;

        while(true) {
            // currentNode = nextNode;
            // console.log("### currentNode = " + currentNode);    // TODO: debug
            var subnetLengthOfCurrentNode = currentNode[I_IPV4_LENGTH_OF_SUBNETMASK];

            // console.log("DEBUG: currentNode-> I_IPV4_DATA=" + currentNode[I_IPV4_DATA] + 
            //         ", I_IPV4_LENGTH_OF_SUBNETMASK="        + currentNode[I_IPV4_LENGTH_OF_SUBNETMASK] + 
            //         ", I_IPV4_LENGTH_OF_CHILD_SUBNETMASK="  + currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]);

            if(subnetLengthOfCurrentNode === subnetLength) {
                // console.log("# DEBUG: # section 1 ############################################");  /* DEBUG: */
                // The data may have been existed
                if(currentNode[I_IPV4_DATA] !== undefined) {
                    // The data have been existed!
                    throw new Error("Aboart pushing due to the data has already existed.");
                }

                // Override the data in this glue node.
                currentNode[I_IPV4_DATA] = data;
                currentNode[I_IPV4_IS_GLUE_NODE] = false;
                // return;    // TODO:
                break;      // TODO:
            } else if(subnetLengthOfCurrentNode < subnetLength) {

                var networkAddress = myself.getBinIPv4NetAddr(binaryIPv4, subnetLength);

                // console.log("Object.keys(currentNode[I_IPV4_REF_CHILD_NODE]).length = " + Object.keys(currentNode[I_IPV4_REF_CHILD_NODE]).length);
                // console.log("currentNode[I_IPV4_REF_CHILD_NODE] = ");
                // console.log(currentNode[I_IPV4_REF_CHILD_NODE]);
                if(Object.keys(currentNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES]).length === 0) {

                    // console.log("# DEBUG: # section 2 ############################################");  /* DEBUG: */

                    // Append the data as a child node
                    // console.log("DEBUG: Append the data from -> I_IPV4_DATA=" + currentNode[I_IPV4_DATA] + 
                    //         ", I_IPV4_LENGTH_OF_SUBNETMASK=" + currentNode[I_IPV4_LENGTH_OF_SUBNETMASK] + 
                    //         ", I_IPV4_LENGTH_OF_CHILD_SUBNETMASK=" + currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]);
                    // console.log("DEBUG:                   to -> I_IPV4_DATA=" + binaryIPv4);

                    // Append the node under the current node
                    // FIXME: createNewChildElement()
                    currentNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][networkAddress]  = myself.createNewOneNode(data, subnetLength, false, undefined, {});
                    currentNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_SUBNET_LENGTH]      = subnetLength;

                    break;
                }

                if(currentNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_SUBNET_LENGTH] > subnetLength) {

                    // console.log("# DEBUG: # section 3 ############################################");  /* DEBUG: */
                    // insert and create glue node for existing node as needed
                    // #########################################################
                    // Create glue node then check the glue node's network address.
                    //   If match: continue
                    //   If not match: insert the node then break
                    myself.createGlueNodes(currentNode, subnetLength);

                    if(!(networkAddress in currentNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES])) {
                        currentNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][networkAddress] = myself.createNewOneNode(data, subnetLength, false, undefined, {});
                        break;
                    }
                    // TODO: continue
                } else if(currentNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_SUBNET_LENGTH] < subnetLength) {
                    // console.log("# DEBUG: # section 4 ############################################");  /* DEBUG: */

                    // continue then new node will be appended
                    var childNetworkAddress = myself.getBinIPv4NetAddr(binaryIPv4, currentNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_SUBNET_LENGTH]);

                    // console.log("Child network address -- " + myself.stringifyFromBinIPv4(childNetworkAddress));    // TODO:
                    if(currentNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][childNetworkAddress] === undefined) {
                        currentNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][childNetworkAddress]
                                = myself.createNewOneNode(undefined, currentNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES], true, undefined, {});
                    }
                    currentNode = currentNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][childNetworkAddress];
                    // TODO: continue
                } else {
                    // console.log("# DEBUG: # section 5 ############################################");  /* DEBUG: */
                    /* currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK] === subnetLength */
                    if(!currentNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][binaryIPv4]) {
                        currentNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][binaryIPv4]
                                = myself.createNewOneNode(undefined, subnetLength, true, undefined, {});
                    }
                    currentNode = currentNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][binaryIPv4];    /* continue */
                }
            } else {
                // no way

                    console.log("Never reachable.");

                return;  // TODO:
            }
        }

    }

    /**
     * Convert the IPv4 string to an unsignet 32bit integer.
     * @param {string} IPv4
     */
    this.iPv4StringToBinary = function(iPv4) {
        var binIPv4     = 0;
        var arrIPv4     = iPv4.split('.');
        var tmpOctet    = 0;

        if(arrIPv4.length != 4) {
            // TODO: Change error more adequate
            throw new Error(iPv4 + " is not a valid IPv4 address format. It's format must be \"n.n.n.n\".");
        }

        for(var i = 0; i < arrIPv4.length; ++i) {
            binIPv4 <<= 8;
            tmpOctet = parseInt(arrIPv4[i]);
            if(isNaN(tmpOctet) || tmpOctet > 255 || tmpOctet < 0) {
                // TODO: Change error more adequate
                throw new Error(
                    "Each octet must be greater or equal to 0 and less or equal 255 or is not NaN(" + iPv4 + ").");
            }
            binIPv4 += parseInt(arrIPv4[i]);
        }

        return binIPv4;
    }

    /**
     * Get network address from binary IPv4 address and length of subnetmask.
     * @param {number} binIPv4    binary IPv4 address(not string IPv4 format)
     * @param {number} subnetLen  Length of subnetmask
     */
    this.getBinIPv4NetAddr = function(binIPv4, subnetLen) {
        return (iPv4NetMasks[subnetLen] & binIPv4);
    }

    /**
     * Create a new node.
     * @param {object} data            Data for node.
     * @param {number} subnetLen       Length of subnet mask length of current node.
     * @param {number} childSubnetLen  Length of subnet mask length of child node.
     */
    this.createNewOneNode = function(data, subnetLen, isGlueNode, childSubnetLen, refToChild) {
        var result = new Array(5);

        result[I_IPV4_DATA]                         = data;
        result[I_IPV4_LENGTH_OF_SUBNETMASK]         = subnetLen;
        result[I_IPV4_IS_GLUE_NODE]                 = isGlueNode;
        result[I_IPV4_CHILD_ELEMENTS]               = myself.createNewChildElement(childSubnetLen, refToChild);

        return result;
    }

    /**
     * Create a new child element
     * @param {number} childSubnetLen  Length of child node's subnet length
     * @param {object} refToChild      Reference to child nodes
     */
    this.createNewChildElement = function(childSubnetLen, refToChild) {
        var result = new Array(2);

        result[I_CHILD_SUBNET_LENGTH]   = childSubnetLen;
        result[I_CHILD_NODES]           = refToChild;

        return result;
    }

    /**
     * Return binary IPv4 dict
     */
    this.getBinTree4 = function() {
        return iPv4Dict;
    }

    /**
     * Stringify binary IPv4 address.
     * @param {number} binIPv4 Binary IPv4 address.
     */
    this.stringifyFromBinIPv4 = function(binIPv4) {
        var copyBinIPv4 = binIPv4;
        var mask256     = ~~255;
        var result      = '';
        for(var i = 0; i < 4; ++i) {
            result = (copyBinIPv4 & mask256) + result;
            if (i < 3) {
                result = '.' + result
                copyBinIPv4 >>>= 8;
            }
        }

        return result;
    }

    this.createGlueNodes = function (node, subnetLength){
        var childNodes = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES];
        var rootOfGlueNodes = {};

        // subnetLength < node[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]
        // FIXME: 

        for(key in childNodes) {
            var netAddress = myself.getBinIPv4NetAddr(key, subnetLength);

            if(!(netAddress in rootOfGlueNodes)) {
                rootOfGlueNodes[netAddress]
                        = myself.createNewOneNode(undefined, subnetLength, true, node[I_IPV4_CHILD_ELEMENTS][I_CHILD_SUBNET_LENGTH], {});
            }
            var glueNode = rootOfGlueNodes[netAddress];
            glueNode[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][key] = childNodes[key];
        }

        // FIXME: atomicity
        node[I_IPV4_CHILD_ELEMENTS][I_CHILD_SUBNET_LENGTH]  = subnetLength;
        node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES]          = rootOfGlueNodes;
    }
}

