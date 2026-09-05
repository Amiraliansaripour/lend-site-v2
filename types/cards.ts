export type BankCard = {
  id: string;
  cardNumber: string;
  // cvv2: string;
  lban: string;
  expiryDate: string;
  bankName: string;
};

export type CreateCardPayload = {
  cardNumber: string;
  // cvv2: string;
  lban: string;
  expiryDate: string;
  bankName: string;
};

export type UpdateCardPayload = CreateCardPayload;
