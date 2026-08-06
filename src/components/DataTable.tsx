import { useMemo, useState, type ReactNode } from 'react';
import { Box, Flex, IconButton, Input, InputGroup, Table, Text } from '@chakra-ui/react';
import { MdSearch, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import Loader from './states/Loader';
import ErrorState from './states/ErrorState';
import EmptyState from './states/EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string | number;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyMessage?: string;
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
}

// Generic, client-side-paginated table (Chakra). The API returns plain arrays today, so
// we page/filter in the browser.
export default function DataTable<T>({
  columns,
  rows,
  getRowId,
  loading,
  error,
  onRetry,
  emptyMessage,
  searchKeys,
  searchPlaceholder,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const perPage = 10;
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!searchKeys?.length || !search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((row) =>
      searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)),
    );
  }, [rows, search, searchKeys]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = useMemo(
    () => filtered.slice(page * perPage, page * perPage + perPage),
    [filtered, page],
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;

  return (
    <Box>
      {searchKeys?.length ? (
        <InputGroup maxW={{ base: '100%', sm: '320px' }} mb={4} startElement={<MdSearch />}>
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder ?? t('common.search')}
            bg="surface"
            borderColor="line"
            rounded="full"
          />
        </InputGroup>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState message={emptyMessage ?? t('common.noData', { defaultValue: 'No data' })} />
      ) : (
        <Box bg="surface" borderWidth="1px" borderColor="line" rounded="card" overflow="hidden">
          <Table.ScrollArea>
            <Table.Root size="md" interactive>
              <Table.Header>
                <Table.Row bg="surfaceAlt">
                  {columns.map((c) => (
                    <Table.ColumnHeader
                      key={c.key}
                      textAlign={c.align}
                      color="fgMuted"
                      fontWeight="700"
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      py={4}
                      borderColor="line"
                    >
                      {c.header}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {paged.map((row) => (
                  <Table.Row
                    key={getRowId(row)}
                    bg="surface"
                    transition="background-color .15s"
                    _hover={{ bg: 'surfaceAlt' }}
                  >
                    {columns.map((c) => (
                      <Table.Cell key={c.key} textAlign={c.align} py={4} fontSize="sm" borderColor="line">
                        {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>

          <Flex align="center" justify="space-between" px={4} py={3} borderTopWidth="1px" borderColor="line">
            <Text fontSize="sm" color="fgMuted">
              {filtered.length === 0 ? 0 : page * perPage + 1}–{Math.min((page + 1) * perPage, filtered.length)}
              {' '}
              {t('common.of', { defaultValue: 'of' })} {filtered.length}
            </Text>
            <Flex align="center" gap={2}>
              <IconButton
                aria-label="prev"
                size="sm"
                variant="ghost"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <MdChevronRight />
              </IconButton>
              <Text fontSize="sm" fontWeight="600" minW="48px" textAlign="center">
                {page + 1} / {pageCount}
              </Text>
              <IconButton
                aria-label="next"
                size="sm"
                variant="ghost"
                disabled={page + 1 >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              >
                <MdChevronLeft />
              </IconButton>
            </Flex>
          </Flex>
        </Box>
      )}
    </Box>
  );
}
