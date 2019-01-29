import { factory } from '@cinerino/api-javascript-client';

type IReservation = factory.chevre.reservation.event.IReservation<factory.chevre.event.screeningEvent.IEvent>;

export interface IDecodeResult extends factory.ownershipInfo.IOwnershipInfo<IReservation> {
    iat: number;
}
