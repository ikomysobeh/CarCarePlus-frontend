import { Button, Field, Input, NativeSelect, SimpleGrid } from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { EMPLOYEE_REPORT_STATUSES } from '../../utils/enums';
import type { EmployeeReportFilters } from './types';

// Shared look for the controls. The filter bar sits on the page background, not inside a card,
// so the fields carry `surface` themselves to stay readable over the app gradient.
const control = {
  bg: 'surface',
  borderColor: 'line',
  rounded: 'lg',
  _hover: { borderColor: 'fgMuted' },
  _focusVisible: {
    borderColor: 'brand.500',
    boxShadow: '0 0 0 1px var(--ccp-colors-brand-500)',
  },
} as const;

/**
 * Filter bar for the employee-reports table. Purely presentational: the parent owns the state
 * and decides when to send it to the API (it debounces — see EmployeeReportsSection).
 */
export default function EmployeeReportFilterBar({
  value,
  onChange,
}: {
  value: EmployeeReportFilters;
  onChange: (next: EmployeeReportFilters) => void;
}) {
  const { t } = useTranslation();
  const set = (patch: Partial<EmployeeReportFilters>) => onChange({ ...value, ...patch });
  const hasAny = Object.values(value).some((v) => v !== '' && v != null);

  const label = { color: 'fgMuted', fontSize: 'xs', fontWeight: '600' } as const;

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} gap={3} mb={4} alignItems="end">
      <Field.Root>
        <Field.Label {...label}>{t('fieldOps.filterSearch')}</Field.Label>
        <Input
          value={value.search ?? ''}
          onChange={(e) => set({ search: e.target.value })}
          placeholder={t('fieldOps.filterSearchHint')}
          {...control}
        />
      </Field.Root>

      <Field.Root>
        <Field.Label {...label}>{t('fieldOps.filterOrder')}</Field.Label>
        <Input
          type="number"
          value={value.order_id ?? ''}
          onChange={(e) => set({ order_id: e.target.value })}
          placeholder="#"
          {...control}
        />
      </Field.Root>

      <Field.Root>
        <Field.Label {...label}>{t('field.status')}</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field
            value={value.status ?? ''}
            onChange={(e) => set({ status: e.target.value as EmployeeReportFilters['status'] })}
            {...control}
          >
            <option value="">{t('fieldOps.filterAllStatuses')}</option>
            {EMPLOYEE_REPORT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {/* Same `status.*` namespace StatusChip uses, so the dropdown label and the
                    chip in the table always read identically. */}
                {t(`status.${s}`, { defaultValue: s })}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>

      <Field.Root>
        <Field.Label {...label}>{t('fieldOps.filterFrom')}</Field.Label>
        <Input
          type="date"
          value={value.from_date ?? ''}
          onChange={(e) => set({ from_date: e.target.value })}
          {...control}
        />
      </Field.Root>

      <Field.Root>
        <Field.Label {...label}>{t('fieldOps.filterTo')}</Field.Label>
        <Input
          type="date"
          value={value.to_date ?? ''}
          onChange={(e) => set({ to_date: e.target.value })}
          {...control}
        />
      </Field.Root>

      {/* Only rendered once something is set — an always-visible "clear" on an empty form is
          dead weight, and its absence is itself a signal that no filter is active. */}
      {hasAny && (
        <Button variant="ghost" size="sm" onClick={() => onChange({})} justifySelf="start">
          <MdClose /> {t('fieldOps.filterClear')}
        </Button>
      )}
    </SimpleGrid>
  );
}
