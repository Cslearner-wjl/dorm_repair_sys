import type { ReactNode } from "react";
import {
  Armchair,
  Bath,
  Building2,
  DoorOpen,
  Droplets,
  MoreHorizontal,
  Wifi,
  Wrench,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, ReactNode> = {
  水电维修: <Droplets size={22} />,
  水电: <Droplets size={22} />,
  门窗维修: <DoorOpen size={22} />,
  门窗: <DoorOpen size={22} />,
  家具维修: <Armchair size={22} />,
  家具: <Armchair size={22} />,
  网络维修: <Wifi size={22} />,
  网络: <Wifi size={22} />,
  卫生维修: <Bath size={22} />,
  卫生: <Bath size={22} />,
  电器维修: <Wrench size={22} />,
  空调: <Wrench size={22} />,
  公共设施: <Building2 size={22} />,
  其他维修: <MoreHorizontal size={22} />,
  其他: <MoreHorizontal size={22} />,
};

export default CATEGORY_ICONS;
