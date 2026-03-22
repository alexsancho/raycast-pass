import { closeMainWindow, getPreferenceValues, Clipboard, LaunchProps, showHUD } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import pass from "./pass";

const preferences = getPreferenceValues<Preferences.GenPass>();

export default async (props: LaunchProps<{ arguments: Arguments.GenPass }>) => {
  await closeMainWindow();

  let mask = preferences.mask;

  if (props.arguments.mask) {
    mask = props.arguments.mask;
  }

  try {
    const pwd = await pass.createPass(mask);
    await Clipboard.copy(pwd);
    await showHUD('Password copied to clipboard');
  } catch (error) {
    await showFailureToast(error, { title: "Could not create a new password." });
  }
};
