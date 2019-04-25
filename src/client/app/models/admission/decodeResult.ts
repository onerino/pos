import { factory } from '@cinerino/api-javascript-client';

type IReservation = factory.chevre.reservation.IReservation<factory.chevre.reservationType.EventReservation>;

export interface IDecodeResult extends factory.ownershipInfo.IOwnershipInfo<IReservation> {
    iat: number;
}
