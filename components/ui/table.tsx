import { cn } from '@/lib/utils';

export function TableWrap({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="table-wrap"
      className={cn('overflow-x-auto rounded-xl border', className)}
      {...props}
    />
  );
}

export function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return <table data-slot="table" className={cn('w-full text-sm', className)} {...props} />;
}

export function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('border-b bg-muted/40 text-xs uppercase text-muted-foreground', className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn(className)} {...props} />;
}

export function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-t bg-muted/40 font-medium', className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn('border-b transition-colors last:border-0 hover:bg-muted/30', className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn('px-3 py-2 text-start font-medium whitespace-nowrap', className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return <td data-slot="table-cell" className={cn('px-3 py-2', className)} {...props} />;
}

export function TableGroupRow({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <tr className="border-b bg-muted/20">
      <td
        data-slot="table-group"
        className={cn('px-3 py-1.5 text-xs font-medium uppercase text-muted-foreground', className)}
        {...props}
      />
    </tr>
  );
}
