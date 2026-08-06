import { Badge } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

// A colored status badge. Maps a backend status to a Chakra color palette and localizes
// the label via `status.<value>` (falls back to the raw value).
const COLOR_BY_STATUS: Record<string, string> = {
  approved: 'green', active: 'green', completed: 'green', paid: 'green', done: 'green', received: 'green',
  pending: 'orange', requested: 'orange',
  in_progress: 'blue', assigned: 'blue', redeem: 'blue',
  earn: 'green',
  draft: 'gray', inactive: 'gray', expired: 'gray',
  rejected: 'red', cancelled: 'red', failed: 'red', suspended: 'red',
};

export default function StatusChip({ status, label }: { status: string; label?: string }) {
  const { t } = useTranslation();
  const color = COLOR_BY_STATUS[status] ?? 'gray';
  const text = label ?? t(`status.${status}`, { defaultValue: status });
  return (
    <Badge colorPalette={color} variant="subtle" rounded="full" px={2.5} py={1}>
      {text}
    </Badge>
  );
}
