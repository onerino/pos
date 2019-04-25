import { factory } from '@cinerino/api-javascript-client';

export interface IReservationSearchConditions {
    reservationDateFrom: string;
    reservationDateThrough: string;
    eventStartDateFrom: string;
    eventStartDateThrough: string;
    id: string;
    reservationNumber: string;
    reservationStatus: '' | factory.chevre.reservationStatusType;
    page: number;
}
