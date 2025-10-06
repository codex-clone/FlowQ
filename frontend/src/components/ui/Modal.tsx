import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}

export const Modal = ({ isOpen, title, description, children, onClose }: ModalProps) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                <Dialog.Title className="text-lg font-semibold text-slate-900">{title}</Dialog.Title>
                {description && <Dialog.Description className="mt-1 text-sm text-slate-600">{description}</Dialog.Description>}
                <div className="mt-4">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
