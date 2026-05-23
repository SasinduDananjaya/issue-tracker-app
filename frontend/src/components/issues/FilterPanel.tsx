import { useState, useEffect } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useFilterStore, activeFilterCount } from "@/store/filterStore";
import { useAuthStore } from "@/store/authStore";
import { ALL_STATUSES, ALL_PRIORITIES, ALL_SEVERITIES, STATUS_LABELS, PRIORITY_LABELS, SEVERITY_LABELS } from "@/lib/constants";
import useDebounce from "@/hooks/useDebounce";
import type { IssueFilters } from "@/types/issueTypes";

const NONE = "__none__";

const FilterPanel = () => {
  const { filters, setFilter, resetFilters } = useFilterStore();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    if (debouncedSearch !== (filters.search ?? "")) {
      setFilter({ search: debouncedSearch || undefined });
    }
  }, [debouncedSearch]);

  const count = activeFilterCount(filters);

  const handleSelect = (key: keyof IssueFilters, value: string) => {
    setFilter({ [key]: value === NONE ? undefined : value });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {count > 0 && <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-primary text-white">{count}</Badge>}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-120 p-0" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-sm text-gray-900">Filters</span>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3 space-y-3">
          {/* Search */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Search by title</Label>
            <Input placeholder="Type to search…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="h-8 text-sm" />
          </div>

          {/* Status and priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Status</Label>
              <Select value={filters.status ?? NONE} onValueChange={(v) => handleSelect("status", v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Any status</SelectItem>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Priority</Label>
              <Select value={filters.priority ?? NONE} onValueChange={(v) => handleSelect("priority", v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Any priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Any priority</SelectItem>
                  {ALL_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Severity + Created by */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Severity</Label>
              <Select value={filters.severity ?? NONE} onValueChange={(v) => handleSelect("severity", v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Any severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Any severity</SelectItem>
                  {ALL_SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SEVERITY_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {user && (
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Created by</Label>
                <Select value={filters.createdBy ?? NONE} onValueChange={(v) => handleSelect("createdBy", v)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Anyone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Anyone</SelectItem>
                    <SelectItem value={user.uuid}>Me ({user.name})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-3 border-t flex justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
            onClick={() => {
              resetFilters();
              setSearchInput("");
            }}
          >
            Reset all
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary-700 text-white" onClick={() => setOpen(false)}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterPanel;
