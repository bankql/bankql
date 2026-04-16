import { Box, Flex, IconButton, Separator, Stack, Text } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import {
  LuDatabase,
  LuHouse,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuSearch,
  LuTable,
} from "react-icons/lu";
import type { IconType } from "react-icons";

interface NavItem {
  icon: IconType;
  label: string;
  to: string;
}

const navItems: NavItem[] = [
  { icon: LuHouse, label: "Home", to: "/" },
  { icon: LuSearch, label: "Query", to: "/" },
  { icon: LuDatabase, label: "Datasets", to: "/" },
  { icon: LuTable, label: "Tables", to: "/" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <Flex
      direction="column"
      h="full"
      w={collapsed ? "12" : "200px"}
      transition="width 0.2s"
      borderRightWidth="1px"
      overflow="hidden"
      flexShrink="0"
    >
      <Stack direction="column" flex="1" gap="1" py="2" px={collapsed ? "1" : "2"}>
        {navItems.map((item) => (
          <Link key={item.label} to={item.to} style={{ textDecoration: "none" }}>
            {collapsed ? (
              <IconButton
                aria-label={item.label}
                variant="ghost"
                size="sm"
                w="full"
              >
                <item.icon />
              </IconButton>
            ) : (
              <Flex
                align="center"
                gap="3"
                px="3"
                py="1.5"
                rounded="md"
                _hover={{ bg: "bg.subtle" }}
                cursor="pointer"
              >
                <Box flexShrink="0">
                  <item.icon />
                </Box>
                <Text textStyle="sm" truncate>
                  {item.label}
                </Text>
              </Flex>
            )}
          </Link>
        ))}
      </Stack>

      <Separator />

      <Flex px={collapsed ? "1" : "2"} py="2" justify={collapsed ? "center" : "flex-end"}>
        <IconButton
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          variant="ghost"
          size="sm"
          onClick={onToggle}
        >
          {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
        </IconButton>
      </Flex>
    </Flex>
  );
}
