import { useState } from 'react';
import { Box, Button, Code, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { usePricingRules, useDeletePricingRule } from './api';
import PricingRuleFormDialog from './PricingRuleFormDialog';
import type { PricingRule } from './types';

export default function PricingRulesSection() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = usePricingRules();
  const del = useDeletePricingRule();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PricingRule | null>(null);
  const [toDelete, setToDelete] = useState<PricingRule | null>(null);

  const columns: Column<PricingRule>[] = [
    { key: 'name_ar', header: t('field.nameAr') },
    { key: 'rule_type', header: t('pricing.ruleTypes'), render: (r) => r.rule_type?.name_ar ?? '—' },
    { key: 'value', header: t('pricing.value'), render: (r) => String(r.value) },
    {
      key: 'conditions',
      header: t('pricing.conditions'),
      render: (r) => (
        <Code fontSize="xs" px={2} py={1} rounded="md">
          {r.conditions ? JSON.stringify(r.conditions) : '—'}
        </Code>
      ),
    },
    {
      key: 'is_active',
      header: t('field.status'),
      render: (r) => <StatusChip status={r.is_active ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <HStack justify="flex-end" gap={1}>
          <IconButton aria-label={t('common.edit')} size="sm" variant="ghost"
            onClick={() => { setEditing(r); setFormOpen(true); }}>
            <MdEdit />
          </IconButton>
          <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red"
            onClick={() => setToDelete(r)}>
            <MdDelete />
          </IconButton>
        </HStack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t('pricing.rules')}
        action={
          <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <MdAdd /> {t('pricing.addRule')}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(r) => r.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchKeys={['name', 'name_ar']}
        emptyMessage={t('pricing.emptyRules')}
      />
      <PricingRuleFormDialog open={formOpen} rule={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('pricing.deleteRuleTitle')}
        message={t('catalog.deleteMessage', { name: toDelete?.name_ar ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
