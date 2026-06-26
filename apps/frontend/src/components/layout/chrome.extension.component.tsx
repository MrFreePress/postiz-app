import { useVariables } from '@gitroom/react/helpers/variable.context';
export const ChromeExtensionComponent = (): null => {
  const { billingEnabled } = useVariables();
  if (!billingEnabled) {
    return null;
  }
  return null;
};
