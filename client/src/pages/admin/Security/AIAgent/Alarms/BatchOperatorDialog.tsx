import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface BatchOperatorDialogProps {
  onOk: () => void;
  title?: string;
  data?: any[];
  okText?: string;
  cancelText?: string;
  onCancel: () => void;
  renderItem: (item: any) => any;
  size?: string | number;
  visible: boolean;
  content?: string | React.ReactNode;
  disabled?: boolean;
}

export default function BatchOperatorDialog({
  onOk,
  title = '操作',
  data = [],
  okText = '确定',
  cancelText = '取消',
  onCancel,
  renderItem,
  visible,
  content = null,
  disabled = false,
}: BatchOperatorDialogProps) {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangeTableShow = () => {
    setShow(!show);
  };

  useEffect(() => {
    if (visible) {
      setShow(false);
      setIsLoading(false);
    }
  }, [visible]);

  return (
    <Dialog open={visible} onOpenChange={open => { if (!open) onCancel(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {content && <div className="text-sm text-gray-600">{content}</div>}

          <div className="text-sm">
            您已经选择 <span className="font-medium text-blue-600">{data?.length}</span> 条数据，
            <button
              onClick={handleChangeTableShow}
              className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
            >
              查看详情
              {show ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {show && data?.length > 0 && (
            <div className="max-h-[130px] overflow-y-auto border border-gray-200 rounded-md">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2 text-gray-400 w-10 text-center">{idx + 1}</td>
                      <td className="px-3 py-2 text-gray-700">{renderItem(item)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setIsLoading(true);
              onOk?.();
            }}
            disabled={disabled || isLoading || !data?.length}
          >
            {okText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
