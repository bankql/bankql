import {
  Box,
  Flex,
  IconButton,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  LuChevronRight,
  LuDatabase,
  LuHouse,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuTable,
} from "react-icons/lu";
import { allDatasets, type DatasetDef } from "@bankql/schema";
import { useLayout } from "~/domains/layout/hooks/useLayout";

const datasetList = allDatasets as unknown as DatasetDef[];

export default function Sidebar() {
  const { sidebar } = useLayout();
  const [datasetsExpanded, setDatasetsExpanded] = useState(true);

  const onCollapsedGroupClick = () => {
    if (!sidebar.open) sidebar.onToggle();
    setDatasetsExpanded(true);
  };

  return (
    <Flex
      direction="column"
      h="full"
      w={sidebar.open ? "220px" : "12"}
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
        overflowY="auto"
      >
        <NavLink to="/" icon={<LuHouse />} label="Home" open={sidebar.open} />

        {sidebar.open ? (
          <>
            <GroupHeader
              icon={<LuDatabase />}
              label="Datasets"
              expanded={datasetsExpanded}
              onToggle={() => setDatasetsExpanded((v) => !v)}
            />
            {datasetsExpanded &&
              datasetList.map((d) => (
                <NavLink
                  key={d.name}
                  to="/datasets/$name"
                  params={{ name: d.name }}
                  icon={<LuTable />}
                  label={d.name}
                  open
                  mono
                  indent
                />
              ))}
          </>
        ) : (
          <IconButton
            aria-label="Datasets"
            variant="ghost"
            size="sm"
            w="full"
            onClick={onCollapsedGroupClick}
          >
            <LuDatabase />
          </IconButton>
        )}
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

interface NavLinkProps {
  to: string;
  params?: Record<string, string>;
  icon: React.ReactNode;
  label: string;
  open: boolean;
  mono?: boolean;
  indent?: boolean;
}

function NavLink({
  to,
  params,
  icon,
  label,
  open,
  mono,
  indent,
}: NavLinkProps) {
  return (
    <Link
      to={to}
      params={params}
      style={{ textDecoration: "none" }}
      activeProps={{ style: { fontWeight: "600" } }}
    >
      {open ? (
        <Flex
          align="center"
          gap="3"
          pl={indent ? "7" : "3"}
          pr="3"
          py="1.5"
          rounded="md"
          _hover={{ bg: "bg.subtle" }}
          cursor="pointer"
        >
          <Box flexShrink="0">{icon}</Box>
          <Text textStyle="sm" truncate fontFamily={mono ? "mono" : undefined}>
            {label}
          </Text>
        </Flex>
      ) : (
        <IconButton aria-label={label} variant="ghost" size="sm" w="full">
          {icon}
        </IconButton>
      )}
    </Link>
  );
}

interface GroupHeaderProps {
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  onToggle: () => void;
}

function GroupHeader({ icon, label, expanded, onToggle }: GroupHeaderProps) {
  return (
    <Flex
      align="center"
      gap="3"
      px="3"
      py="1.5"
      rounded="md"
      _hover={{ bg: "bg.subtle" }}
      cursor="pointer"
      onClick={onToggle}
    >
      <Box flexShrink="0">{icon}</Box>
      <Text textStyle="sm" flex="1" fontWeight="medium">
        {label}
      </Text>
      <Box
        flexShrink="0"
        transition="transform 0.15s"
        transform={expanded ? "rotate(90deg)" : "rotate(0deg)"}
        color="fg.muted"
      >
        <LuChevronRight />
      </Box>
    </Flex>
  );
}
