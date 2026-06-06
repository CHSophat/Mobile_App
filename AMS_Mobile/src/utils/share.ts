import { Platform, Share, ShareContent, ShareOptions } from 'react-native';
import i18n from '@i18n/index';

export type ShareKind =
  | 'invoice'
  | 'payment'
  | 'maintenance'
  | 'profile'
  | 'property'
  | 'generic';

export interface SharePayload {
  kind: ShareKind;
  title?: string;
  message?: string;
  url?: string;
  context?: Record<string, string | number>;
}

const buildMessage = (payload: SharePayload): string => {
  if (payload.message) return payload.message;
  const { kind, context = {} } = payload;
  switch (kind) {
    case 'invoice':
      return i18n.t('share.invoice', context);
    case 'payment':
      return i18n.t('share.payment', context);
    case 'maintenance':
      return i18n.t('share.maintenance', context);
    case 'profile':
      return i18n.t('share.profile', context);
    case 'property':
      return i18n.t('share.property', context);
    default:
      return i18n.t('share.sharedVia');
  }
};

const buildTitle = (payload: SharePayload): string => {
  if (payload.title) return payload.title;
  switch (payload.kind) {
    case 'invoice':
      return i18n.t('payments.invoice');
    case 'payment':
      return i18n.t('payments.title');
    case 'maintenance':
      return i18n.t('maintenance.title');
    case 'profile':
      return i18n.t('profile.title');
    case 'property':
      return i18n.t('common.appName');
    default:
      return i18n.t('common.appName');
  }
};

export const shareContent = async (
  payload: SharePayload
): Promise<{ success: boolean; dismissed?: boolean; error?: string }> => {
  const title = buildTitle(payload);
  const body = buildMessage(payload);
  const url = payload.url;

  // iOS: pass `url` separately so the share sheet handles UTIs.
  // Android: only `message` is honored, so append the url into the text.
  const content: ShareContent =
    Platform.OS === 'ios'
      ? { title, message: body, ...(url ? { url } : {}) }
      : { title, message: url ? `${body}\n${url}` : body };

  const options: ShareOptions = { dialogTitle: title };

  try {
    const res = await Share.share(content, options);
    if (res.action === Share.dismissedAction) {
      return { success: false, dismissed: true };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Share failed' };
  }
};
