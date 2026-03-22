import { useEffect, useState } from "react";
import { Detail } from "@raycast/api";
import { generateQRCode } from "./utils";

export default function ({ entry }: { entry: string }) {
  const [qrData, setQrData] = useState<string>();

  useEffect(() => {
    generateQRCode(entry).then(setQrData);
  });

  return <Detail isLoading={!qrData} markdown={`![qrcode](${qrData})`} />;
}
