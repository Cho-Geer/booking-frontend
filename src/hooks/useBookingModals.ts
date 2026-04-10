import { useState } from 'react';
import { Booking, TimeSlot } from '@/types';

interface UseBookingModalsReturn {
  // Detail Modal
  showDetailModal: boolean;
  detailBooking: Booking | null;
  handleOpenDetail: (booking: Booking) => void;
  handleCloseDetailModal: () => void;
  
  // Update Modal
  showUpdateModal: boolean;
  updateBookingTarget: Booking | null;
  updatingBooking: boolean;
  handleOpenUpdate: (booking: Booking) => void;
  handleCloseUpdateModal: () => void;
  setUpdatingBooking: (value: boolean) => void;
  
  // Alternative Slots Modal
  showAlternativeModal: boolean;
  alternativeSlots: TimeSlot[];
  conflictSlot: TimeSlot | null;
  handleOpenAlternativeModal: (slot: TimeSlot, alternatives: TimeSlot[]) => void;
  handleCloseAlternativeModal: () => void;
  handleAlternativeSelect: (slot: TimeSlot) => void;
}

/**
 * 分子Hook：预约页面Modal状态管理
 * 统一管理BookingPage中的各种Modal状态
 * 
 * @hook
 */
export const useBookingModals = (availableSlots: { isBooked: boolean; isPast?: boolean }[], onSlotSelect: (slot: TimeSlot) => void): UseBookingModalsReturn => {
  // Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  
  // Update Modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateBookingTarget, setUpdateBookingTarget] = useState<Booking | null>(null);
  const [updatingBooking, setUpdatingBooking] = useState(false);
  
  // Alternative Slots Modal
  const [showAlternativeModal, setShowAlternativeModal] = useState(false);
  const [alternativeSlots, setAlternativeSlots] = useState<TimeSlot[]>([]);
  const [conflictSlot, setConflictSlot] = useState<TimeSlot | null>(null);

  const handleOpenDetail = (booking: Booking) => {
    setDetailBooking(booking);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setDetailBooking(null);
  };

  const handleOpenUpdate = (booking: Booking) => {
    setUpdateBookingTarget(booking);
    setShowUpdateModal(true);
    setShowDetailModal(false);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdateBookingTarget(null);
  };

  const handleOpenAlternativeModal = (slot: TimeSlot, alternatives: TimeSlot[]) => {
    setConflictSlot(slot);
    setAlternativeSlots(alternatives);
    setShowAlternativeModal(true);
  };

  const handleCloseAlternativeModal = () => {
    setShowAlternativeModal(false);
    setAlternativeSlots([]);
    setConflictSlot(null);
  };

  const handleAlternativeSelect = (slot: TimeSlot) => {
    setShowAlternativeModal(false);
    onSlotSelect(slot);
  };

  return {
    // Detail Modal
    showDetailModal,
    detailBooking,
    handleOpenDetail,
    handleCloseDetailModal,
    
    // Update Modal
    showUpdateModal,
    updateBookingTarget,
    updatingBooking,
    handleOpenUpdate,
    handleCloseUpdateModal,
    setUpdatingBooking,
    
    // Alternative Slots Modal
    showAlternativeModal,
    alternativeSlots,
    conflictSlot,
    handleOpenAlternativeModal,
    handleCloseAlternativeModal,
    handleAlternativeSelect
  };
};

export default useBookingModals;
