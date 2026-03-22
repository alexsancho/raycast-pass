import { Action, ActionPanel, getPreferenceValues, Icon, List } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { useEffect, useState } from "react";
import humanizeString from "humanize-string";
import pass from "./pass";
import Qr from "./qr";

const preferences = getPreferenceValues<Preferences.SearchPass>();

export default function ({ entry }: { entry: string }) {
  const [details, setDetails] = useState<[string, string][]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    pass
      .show(entry)
      .then(setDetails)
      .catch(async (error) => {
        await showFailureToast(error, { title: "Could not load passwords" });
      })
      .finally(() => setLoading(false));
  }, [entry]);

  return (
    <List isLoading={loading}>
      <List.Section title={"/" + entry}>
        {details.map(([key, value]) => (
          <List.Item
            key={key}
            title={humanizeString(key)}
            accessories={[{ text: key === "pass" ? "******" : value }]}
            actions={
              <ActionPanel>
                {preferences.primaryAction === "copy" ? (
                  <>
                    <Action.CopyToClipboard content={value} concealed />
                    <Action.Paste content={value} />
                  </>
                ) : (
                  <>
                    <Action.Paste content={value} />
                    <Action.CopyToClipboard content={value} concealed />
                  </>
                )}
                {key === 'pass' &&
                  <Action.Push
                    icon={Icon.Document}
                    title="Show QR"
                    target={<Qr entry={value} />}
                    shortcut={{ modifiers: ["opt"], key: "q" }}
                  />
                }
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
