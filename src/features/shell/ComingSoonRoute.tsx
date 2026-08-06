import { useTranslation } from 'react-i18next';
import { ComingSoon } from '../../components';
import type { ModuleKey } from '../../utils/permissions';

// Renders the styled ComingSoon page for a not-yet-built module, using its localized
// title (nav.<module>) and a per-module note about which backend endpoints it awaits.
export default function ComingSoonRoute({ module }: { module: ModuleKey }) {
  const { t } = useTranslation();
  return (
    <ComingSoon
      title={t(`nav.${module}`)}
      note={t(`comingSoonNote.${module}`, { defaultValue: t('comingSoonBody') })}
    />
  );
}
