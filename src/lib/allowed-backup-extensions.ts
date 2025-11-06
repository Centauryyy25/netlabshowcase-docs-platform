const BASE_VENDOR_ICON_PATH = "/vendor-icons";

export const allowedBackupExtensions = [
  ".txt",
  ".cfg",
  ".config",
  ".xml",
  ".tar.gz",
  ".backup",
  ".rsc",
  ".conf",
  ".zip",
  ".cc",
  ".dat",
  ".bak",
  ".bin",
  ".xos",
  ".conf.enc",
  ".unf",
  ".exp",
  ".db",
  ".json",
  ".yaml",
  ".yml",
  ".cli",
  ".rom",
  ".tgz",
  ".tar",
] as const;

export const vendorMap: Record<string, readonly string[]> = {
  Cisco: [".txt", ".cfg", ".config", ".xml", ".tar.gz"],
  MikroTik: [".backup", ".rsc"],
  Ruijie: [".cfg", ".bak", ".zip"],
  Huawei: [".cfg", ".zip", ".cc", ".dat"],
  H3C: [".cfg", ".bin", ".zip"],
  Fortinet: [".conf", ".conf.enc"],
  PaloAlto: [".xml", ".tgz"],
  Ubiquiti: [".cfg", ".tar.gz", ".unf"],
  Juniper: [".conf", ".tgz"],
  Arista: [".cfg", ".tgz"],
  "TP-Link": [".bin", ".cfg"],
  "D-Link": [".cfg", ".xml"],
  ZTE: [".cfg", ".bin", ".zip"],
  Brocade: [".cfg", ".conf", ".zip"],
  Extreme: [".cfg", ".xos"],
  "HP-Aruba": [".cfg", ".tar.gz", ".xml"],
  AlliedTelesis: [".cfg", ".conf", ".tar"],
  CheckPoint: [".tgz", ".db"],
  SonicWall: [".exp"],
  Versa: [".json", ".tar.gz"],
  "VMware-NSX": [".json", ".zip", ".tar.gz"],
  Nokia: [".cli", ".cfg", ".tgz"],
  Ciena: [".cfg", ".zip", ".xml"],
  Dell: [".cfg", ".conf"],
  Avaya: [".cfg", ".xml", ".tar"],
  Tenda: [".bin", ".cfg"],
  Cambium: [".cfg", ".json", ".zip"],
  Hikvision: [".cfg", ".xml"],
  Zyxel: [".conf", ".rom", ".zip"],
  Generic: [".json", ".yaml", ".yml", ".zip"],
};

export const vendorIconMap: Record<string, string> = {
  Cisco: `${BASE_VENDOR_ICON_PATH}/cisco.svg`,
  MikroTik: `${BASE_VENDOR_ICON_PATH}/mikrotik.svg`,
  Ruijie: `${BASE_VENDOR_ICON_PATH}/ruijie.svg`,
  Huawei: `${BASE_VENDOR_ICON_PATH}/huawei.svg`,
  Fortinet: `${BASE_VENDOR_ICON_PATH}/fortinet.svg`,
  PaloAlto: `${BASE_VENDOR_ICON_PATH}/paloalto.svg`,
  Ubiquiti: `${BASE_VENDOR_ICON_PATH}/ubiquiti.svg`,
  Arista: `${BASE_VENDOR_ICON_PATH}/arista.svg`,
  ZTE: `${BASE_VENDOR_ICON_PATH}/zte.svg`,
  Generic: `${BASE_VENDOR_ICON_PATH}/network.svg`,
};

const TEXT_PREVIEW_EXTENSIONS = new Set([
  ".cfg",
  ".txt",
  ".conf",
  ".rsc",
  ".xml",
  ".json",
  ".yaml",
  ".yml",
  ".cli",
  ".config",
]);

const BINARY_ONLY_EXTENSIONS = new Set([".bin", ".backup"]);

const extensionTypeMap: Record<string, string> = {
  ".rsc": "RouterOS Script Export",
  ".cfg": "Configuration File",
  ".conf": "Configuration File",
  ".txt": "Plain Text Snapshot",
  ".xml": "XML Configuration",
  ".backup": "System Backup Image",
  ".bin": "Binary Firmware/Backup",
  ".tar.gz": "Compressed Archive",
  ".tgz": "Compressed Archive",
  ".zip": "ZIP Archive",
  ".json": "JSON Configuration",
  ".yaml": "YAML Configuration",
  ".yml": "YAML Configuration",
  ".cli": "CLI Snapshot",
  ".config": "Configuration Template",
  ".conf.enc": "Encrypted Configuration",
  ".unf": "UNMS Backup",
  ".xos": "ExtremeXOS Image",
  ".rom": "ROM Configuration",
  ".tar": "TAR Archive",
  ".db": "Database Export",
  ".exp": "Export Package",
  ".cc": "Configuration Bundle",
  ".dat": "Data Backup",
  ".bak": "Backup File",
};

const sortedExtensions = [...allowedBackupExtensions].sort(
  (a, b) => b.length - a.length,
);

const normalizedVendorMap = Object.fromEntries(
  Object.entries(vendorMap).map(([vendor, extensions]) => [
    vendor,
    extensions.map(ext => ext.toLowerCase()),
  ]),
);

export type SupportedBackupExtension =
  (typeof allowedBackupExtensions)[number];

const normalizeTarget = (target?: string | null): string =>
  target?.trim().toLowerCase() ?? "";

export const getMatchingExtension = (
  target?: string | null,
): string | null => {
  const normalizedTarget = normalizeTarget(target);

  if (!normalizedTarget) {
    return null;
  }

  return (
    sortedExtensions.find(ext => normalizedTarget.endsWith(ext)) ?? null
  );
};

export const validateExtension = (filename?: string | null): boolean =>
  Boolean(getMatchingExtension(filename));

export const detectVendor = (filename?: string | null): string => {
  const extension = getMatchingExtension(filename);

  if (!extension) {
    return "Unknown Vendor";
  }

  const vendorEntry = Object.entries(normalizedVendorMap).find(
    ([, extensions]) => extensions.includes(extension),
  );

  return vendorEntry?.[0] ?? "Unknown Vendor";
};

export const getVendorIcon = (vendor: string): string =>
  vendorIconMap[vendor] ?? vendorIconMap.Generic;

export const getFileTypeLabel = (target?: string | null): string => {
  const extension = getMatchingExtension(target);
  return extension
    ? extensionTypeMap[extension] ?? "Network Backup File"
    : "Network Backup File";
};

export const isTextPreviewExtension = (target?: string | null): boolean => {
  const extension = getMatchingExtension(target);
  return extension ? TEXT_PREVIEW_EXTENSIONS.has(extension) : false;
};

export const isBinaryOnlyExtension = (
  target?: string | null,
): boolean => {
  const extension = getMatchingExtension(target);
  return extension ? BINARY_ONLY_EXTENSIONS.has(extension) : false;
};

export const buildBackupMetadata = (filename?: string | null) => {
  const extension = getMatchingExtension(filename);
  const vendor = detectVendor(filename);

  return {
    filename: filename ?? "",
    extension,
    vendor,
    vendorIcon: getVendorIcon(vendor),
    fileType: getFileTypeLabel(extension),
    isValid: Boolean(extension),
    isPreviewable: extension ? isTextPreviewExtension(extension) : false,
    isBinaryOnly: extension ? isBinaryOnlyExtension(extension) : false,
  };
};
