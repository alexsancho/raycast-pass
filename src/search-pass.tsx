import {
  Action,
  ActionPanel,
  List,
  showToast,
  Toast,
  Icon,
  getPreferenceValues,
  openExtensionPreferences,
} from "@raycast/api";
import { useEffect, useState } from "react";
import Fuse from "fuse.js";
import pass from "./pass";
import Show from "./show";
import { isDirectory } from "./utils";
import Metadata from "./metadata";

const preferences = getPreferenceValues<Preferences.SearchPass>();

const getIcon = (entry: string) => (isDirectory(entry) ? Icon.Folder : Icon.Key);
const getTarget = (entry: string) => (isDirectory(entry) ? <Main prefix={entry} /> : <Show entry={entry} />);

export default function Main({ prefix = "" }) {
  const [entries, setEntries] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState("");

  useEffect((): void => {
    pass
      .list(prefix, !!searchText)
      .then((data) => {
        if (searchText) {
          return new Fuse(data, { useExtendedSearch: true, keys: ["item"] })
            .search(searchText)
            .map((item) => item.item);
        }
        return data;
      })
      .then(setEntries)
      .catch(async () => {
        await showToast({ title: "Could not load passwords", style: Toast.Style.Failure });
      })
      .finally(() => setLoading(false));
  }, [searchText]);

  return (
    <List isLoading={loading} filtering={false} onSearchTextChange={setSearchText} isShowingDetail={preferences.detail}>
      <List.Section title={searchText ? "Results" : "/" + prefix} subtitle={searchText && String(entries.length)}>
        {entries?.map((entry) => {
          const fullPath = prefix + entry;
          return (
            <List.Item
              key={entry}
              title={entry}
              icon={getIcon(entry)}
              detail={!isDirectory(fullPath) && <Metadata entry={fullPath} />}
              accessories={[{ icon: Icon.ChevronRight }]}
              actions={
                <ActionPanel>
                  <Action.Push title="Select" target={getTarget(fullPath)} />
                  <Action title="Open Extension Preferences" onAction={openExtensionPreferences} />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
    </List>
  );
}
