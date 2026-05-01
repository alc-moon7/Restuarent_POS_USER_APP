import { Send } from 'lucide-react';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input, Textarea } from '../ui/Input';

export type CheckoutFormValues = {
  customerName: string;
  tableNo: string;
  note: string;
};

export function CheckoutForm({
  values,
  onChange,
  onSubmit,
  submitting,
  disabled,
}: {
  values: CheckoutFormValues;
  onChange: (values: CheckoutFormValues) => void;
  onSubmit: () => void;
  submitting: boolean;
  disabled: boolean;
}) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-black text-pos-slate">Checkout</h2>
      <div className="mt-4 grid gap-3">
        <Input
          value={values.customerName}
          onChange={(event) =>
            onChange({ ...values, customerName: event.target.value })
          }
          placeholder="Customer name (optional)"
        />
        <Input
          value={values.tableNo}
          onChange={(event) => onChange({ ...values, tableNo: event.target.value })}
          placeholder="Table number"
        />
        <Textarea
          value={values.note}
          onChange={(event) => onChange({ ...values, note: event.target.value })}
          placeholder="Order note"
        />
        <Button
          size="lg"
          disabled={disabled}
          loading={submitting}
          onClick={onSubmit}
          icon={<Send size={18} />}
        >
          Place Order
        </Button>
      </div>
    </Card>
  );
}
