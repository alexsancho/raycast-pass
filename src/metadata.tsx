import { List } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { useEffect, useState } from "react";
import humanizeString from "humanize-string";
import { generateQRCode } from "./utils";
import pass from "./pass";

export default function ({ entry }: { entry: string }) {
  const [details, setDetails] = useState<[string, string][]>([]);
  const [password, setPassword] = useState<string>('');
  const [qrData, setQrData] = useState<string>();

  useEffect(() => {
    pass
      .show(entry)
      .then((data) => {
        const newData = data.slice(1);
        setPassword(data[0].pop() || '');

        return newData;
      })
      .then(setDetails)
      .catch(async (error) => {
        await showFailureToast(error, { title: "Could not load passwords" });
      })
  }, [entry]);

  useEffect(() => {
    generateQRCode(password).then(setQrData);
  }, [password]);

  return (
    <List.Item.Detail
      isLoading={qrData === undefined}
      markdown={`![qrcode](${qrData})`}
      metadata={
        details &&
        <List.Item.Detail.Metadata>
          {details.map(([key, value]) => (
            <List.Item.Detail.Metadata.Label
              key={key}
              title={humanizeString(key)}
              text={key === "pass" ? '******' : value}
            />
          ))}
        </List.Item.Detail.Metadata>
      }
    />
  );
}
