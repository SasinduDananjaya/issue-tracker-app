import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, SlidersHorizontal, CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useFilterStore, activeFilterCount } from "@/store/filterStore";
import { useAuthStore } from "@/store/authStore";
import { ALL_STATUSES, ALL_PRIORITIES, ALL_SEVERITIES, STATUS_LABELS, PRIORITY_LABELS, SEVERITY_LABELS } from "@/lib/constants";
import useDebounce from "@/hooks/useDebounce";
import useIsMobile from "@/hooks/useIsMobile";
import type { IssueFilters } from "@/types/issueTypes";

const toLocalISO = (date: Date, endOfDay = false) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}${endOfDay ? "T23:59:59" : "T00:00:00"}`;
};

const NONE = "__none__";

const FilterPanel = () => {
  const { filters, setFilter, resetFilters } = useFilterStore();
  const user = useAuthStore((s) => s.user);
  const isMobile = useIsMobile();
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

  const fromDate = filters.dueDateFrom ? new Date(filters.dueDateFrom) : undefined;
  const toDate = filters.dueDateTo ? new Date(filters.dueDateTo) : undefined;
  const dateRange: DateRange | undefined = fromDate || toDate ? { from: fromDate, to: toDate } : undefined;

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    let to = range?.to;
    if (range?.from && to) {
      const max = new Date(range.from);
      max.setDate(max.getDate() + 30);
      if (to > max) {
        to = max;
        toast.warning("Max range is 30 days");
      }
    }
    setFilter({
      dueDateFrom: range?.from ? toLocalISO(range.from) : undefined,
      dueDateTo: to ? toLocalISO(to, true) : undefined,
    });
  };

  // disable dates outside the 30-day window once a start is chosen
  const disableOutOfRange = (date: Date): boolean => {
    if (!dateRange?.from || dateRange.to) return false;
    const max = new Date(dateRange.from);
    max.setDate(max.getDate() + 30);
    return date < dateRange.from || date > max;
  };

  const trigger = (
    <Button variant="outline" className="gap-2 relative">
      <SlidersHorizontal className="w-4 h-4" />
      Filters
      {count > 0 && <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-primary text-white">{count}</Badge>}
    </Button>
  );

  const filterBody = (
    <div className="px-4 py-3 space-y-3">
      {/* Search */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">Search by title</Label>
        <Input placeholder="Type to search…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="h-8 text-sm" />
      </div>

      {/* status and priority */}
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

      {/* severity and created by */}
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

      {/* Modified by */}
      {user && (
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Modified by</Label>
          <Select value={filters.updatedBy ?? NONE} onValueChange={(v) => handleSelect("updatedBy", v)}>
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

      {/* Due date range */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">Due date range</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full h-8 justify-start gap-2 text-xs font-normal">
              <CalendarIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <span>
                    {format(dateRange.from, "MMM d, yyyy")} → {format(dateRange.to, "MMM d, yyyy")}
                  </span>
                ) : (
                  <span>From {format(dateRange.from, "MMM d, yyyy")}</span>
                )
              ) : (
                <span className="text-gray-400">Pick a range…</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="range" selected={dateRange} onSelect={handleDateRangeSelect} disabled={disableOutOfRange} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  const filterFooter = (
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
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="bottom" className="p-0 rounded-t-xl max-h-[90vh] flex flex-col" showCloseButton={false}>
          <SheetHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
            <SheetTitle className="text-sm font-semibold text-gray-900">Filters</SheetTitle>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </SheetHeader>
          <div className="overflow-y-auto flex-1">{filterBody}</div>
          {filterFooter}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-120 p-0" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-sm text-gray-900">Filters</span>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        {filterBody}
        {filterFooter}
      </PopoverContent>
    </Popover>
  );
};

export default FilterPanel;
