'use client';

import { toast } from "sonner";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import InfoIcon from '@mui/icons-material/Info';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-center',
      icon: <CheckCircleIcon sx={{ fontSize: 20, color: 'white' }} />,
      style: {
        background: '#22c55e',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: 500,
      },
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      duration: 3000,
      position: 'top-center',
      icon: <CancelIcon sx={{ fontSize: 20, color: 'white' }} />,
      style: {
        background: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: 500,
      },
    });
  },
  
  warning: (message: string) => {
    toast.warning(message, {
      duration: 3000,
      position: 'top-center',
      icon: <ReportProblemIcon sx={{ fontSize: 20, color: 'white' }} />,
      style: {
        background: '#f59e0b',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: 500,
      },
    });
  },
  
  delete: (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-center',
      icon: <DeleteForeverIcon sx={{ fontSize: 20, color: 'white' }} />,
      style: {
        background: '#dc2626',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: 500,
      },
    });
  },
  
  info: (message: string) => {
    toast.info(message, {
      duration: 3000,
      position: 'top-center',
      icon: <InfoIcon sx={{ fontSize: 20, color: 'white' }} />,
      style: {
        background: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: 500,
      },
    });
  },
};