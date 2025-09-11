---
layout: default
title: "Ubuntu eth name match mac config"
date: 2024-07-08 12:00:00 +0800
categories: [Ubuntu, Network]
tags: [ubuntu, network, mac, config]
---

Bash script with additional echo statements to display the network interface names and MAC addresses for debugging purposes:

```shell
lshw -C network
```

```shell
  *-network:0               
       description: Ethernet interface
       product: 82576 Gigabit Network Connection
       vendor: Intel Corporation
       physical id: 0
       bus info: pci@0000:05:00.0
       logical name: eth1
       version: 01
       serial: a0:10:a1:b1:ce:50
       capacity: 1Gbit/s
       width: 32 bits
       clock: 33MHz
       capabilities: pm msi msix pciexpress bus_master cap_list rom ethernet physical tp 10bt 10bt-fd 100bt 100bt-fd 1000bt-fd autonegotiation
       configuration: autonegotiation=on broadcast=yes driver=igb driverversion=5.15.0-89-generic firmware=1.2.1 ip=192.168.10.11 latency=0 link=no multicast=yes port=twisted pair
       resources: irq:36 memory:fc020000-fc03ffff memory:fbc00000-fbffffff ioport:f020(size=32) memory:fc044000-fc047fff memory:fb800000-fbbfffff memory:fc048000-fc067fff memory:fc068000-fc087fff
  *-network:1
       description: Ethernet interface
       product: 82576 Gigabit Network Connection
       vendor: Intel Corporation
       physical id: 0.1
       bus info: pci@0000:05:00.1
       logical name: eth2
       version: 01
       serial: a0:10:a1:b1:ce:51
       size: 1Gbit/s
       capacity: 1Gbit/s
       width: 32 bits
       clock: 33MHz
       capabilities: pm msi msix pciexpress bus_master cap_list rom ethernet physical tp 10bt 10bt-fd 100bt 100bt-fd 1000bt-fd autonegotiation
       configuration: autonegotiation=on broadcast=yes driver=igb driverversion=5.15.0-89-generic duplex=full firmware=1.2.1 ip=192.168.12.11 latency=0 link=yes multicast=yes port=twisted pair speed=1Gbit/s
       resources: irq:40 memory:fc000000-fc01ffff memory:fb400000-fb7fffff ioport:f000(size=32) memory:fc040000-fc043fff memory:fb000000-fb3fffff memory:fc088000-fc0a7fff memory:fc0a8000-fc0c7fff
  *-network
       description: Ethernet interface
       product: RTL8125 2.5GbE Controller
       vendor: Realtek Semiconductor Co., Ltd.
       physical id: 0
       bus info: pci@0000:06:00.0
       logical name: eth0
       version: 05
       serial: 00:5c:b1:00:c5:75
       capacity: 1Gbit/s
       width: 64 bits
       clock: 33MHz
       capabilities: pm msi pciexpress msix vpd bus_master cap_list ethernet physical tp mii 10bt 10bt-fd 100bt 100bt-fd 1000bt-fd autonegotiation
       configuration: autonegotiation=on broadcast=yes driver=r8169 driverversion=5.15.0-89-generic latency=0 link=no multicast=yes port=twisted pair
       resources: irq:40 ioport:e000(size=256) memory:fc200000-fc20ffff memory:fc210000-fc213fff
```

From the `lshw` output, you have three network interfaces, each with detailed information. The interfaces are:

1. **eth0**
    
    - **Product:** RTL8125 2.5GbE Controller
    - **Vendor:** Realtek Semiconductor Co., Ltd.
    - **Bus info:** `pci@0000:06:00.0`
    - **MAC Address:** 00:5c:b1:00:c5:75
2. **eth1**
    
    - **Product:** 82576 Gigabit Network Connection
    - **Vendor:** Intel Corporation
    - **Bus info:** `pci@0000:05:00.0`
    - **MAC Address:** a0:10:a1:b1:ce:50
3. **eth2**
    
    - **Product:** 82576 Gigabit Network Connection
    - **Vendor:** Intel Corporation
    - **Bus info:** `pci@0000:05:00.1`
    - **MAC Address:** a0:10:a1:b1:ce:51

### Determining the Onboard Ethernet Interface

Typically, onboard network interfaces will have a different bus location compared to PCIe network cards. In your case:

- **eth0** is on `pci@0000:06:00.0`
- **eth1** and **eth2** are on `pci@0000:05:00.0` and `pci@0000:05:00.1`, respectively.

Since both `eth1` and `eth2` are on the same bus and likely part of the same PCIe card (they both have similar bus info and are both Intel 82576 controllers), it is highly likely that **eth0** (Realtek RTL8125) is your onboard network interface.

```bash
#!/bin/bash

# Function to get the MAC address for a given interface product
get_mac_address() {
    local product_name="$1"
    lshw -C network | grep -A 10 "$product_name" | grep serial | awk '{print $2}'
}

# Get MAC addresses of the interfaces
MB_ETH_MAC=$(get_mac_address "RTL8125 2.5GbE Controller")
PCI_ETH1_MAC=$(get_mac_address "82576 Gigabit Network Connection" | head -n 1)
PCI_ETH2_MAC=$(get_mac_address "82576 Gigabit Network Connection" | tail -n 1)

# Display the MAC addresses for debugging
echo "Detected MAC addresses:"
echo "Onboard (Realtek RTL8125) - eth0: $MB_ETH_MAC"
echo "PCIe (Intel 82576) - eth1: $PCI_ETH1_MAC"
echo "PCIe (Intel 82576) - eth2: $PCI_ETH2_MAC"

# Check if we successfully retrieved all MAC addresses
if [ -z "$MB_ETH_MAC" ] || [ -z "$PCI_ETH1_MAC" ] || [ -z "$PCI_ETH2_MAC" ]; then
    echo "Error: Unable to retrieve all MAC addresses. Please check the network interfaces."
    exit 1
fi

# Create udev rules file
UDEV_RULES_FILE="/etc/udev/rules.d/70-persistent-net.rules"

echo "Creating udev rules file at $UDEV_RULES_FILE..."

# Write udev rules to the file
cat <<EOL | sudo tee $UDEV_RULES_FILE
# Udev rules to set persistent names for network interfaces

# Onboard interface (Realtek RTL8125) as eth0
SUBSYSTEM=="net", ACTION=="add", ATTR{address}=="$MB_ETH_MAC", NAME="eth0"

# PCIe interfaces (Intel 82576) as eth1 and eth2
SUBSYSTEM=="net", ACTION=="add", ATTR{address}=="$PCI_ETH1_MAC", NAME="eth1"
SUBSYSTEM=="net", ACTION=="add", ATTR{address}=="$PCI_ETH2_MAC", NAME="eth2"
EOL

echo "Udev rules created successfully."

# Reload udev rules
echo "Reloading udev rules..."
sudo udevadm control --reload-rules

# Optionally, you can trigger the udev rules (to rename interfaces without a reboot)
echo "Triggering udev rules..."
sudo udevadm trigger --action=add

echo "Network interfaces should now be consistently named."

# Display the new udev rules for verification
echo "Here are the new udev rules:"
cat $UDEV_RULES_FILE
```

### Explanation of the Additions

1. **Debugging Information:**
   - Added echo statements to display the detected MAC addresses for each network interface.
   - This helps in verifying that the script is correctly identifying the MAC addresses before creating the udev rules.

### Steps to Run the Script

1. **Create the Script:**

   Save the above script to a file, for example, `eth_name_mac_config.sh`.

2. **Make the Script Executable:**

   ```bash
   chmod +x eth_name_mac_config.sh
   ```

3. **Run the Script:**

   ```bash
   sudo ./eth_name_mac_config.sh
   ```

After running the script, it will print the detected MAC addresses and the newly created udev rules for verification. This should help in debugging and ensuring the network interfaces are named correctly based on their MAC addresses.
