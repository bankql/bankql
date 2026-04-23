import {
  Box,
  Flex,
  IconButton,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
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
import { useLayout } from "~/domains/layout/hooks/useLayout";

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

export default function Sidebar() {
  const { sidebar } = useLayout();

  return (
    <Flex
      direction="column"
      h="full"
      w={sidebar.open ? "200px" : "12"}
      transition="width 0.2s"
      borderRightWidth="1px"
      overflow="hidden"
      flexShrink="0"
    >
      <Stack
        direction="column"
        flex="1"
        gap="1"
        py="2"
        px={sidebar.open ? "2" : "1"}
      >
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            style={{ textDecoration: "none" }}
          >
            {sidebar.open ? (
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
            ) : (
              <IconButton
                aria-label={item.label}
                variant="ghost"
                size="sm"
                w="full"
              >
                <item.icon />
              </IconButton>
            )}
          </Link>
        ))}
      </Stack>

      <Separator />

      <Flex
        px={sidebar.open ? "2" : "1"}
        py="2"
        justify={sidebar.open ? "flex-end" : "center"}
      >
        <IconButton
          aria-label={sidebar.open ? "Collapse sidebar" : "Expand sidebar"}
          variant="ghost"
          size="sm"
          onClick={sidebar.onToggle}
        >
          {sidebar.open ? <LuPanelLeftClose /> : <LuPanelLeftOpen />}
        </IconButton>
      </Flex>
    </Flex>
  );
}
