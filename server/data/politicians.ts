interface Politician {
  id: number;
  name: string;
  party: string;
  position: string;
  imageUrl: string;
  rating?: number;
  aliases: string[];
}

// Politicians data imported from JSON
export const knessetMembers: Politician[] = [
  {
    id: 1,
    name: "בנימין נתניהו",
    party: "הליכוד",
    position: "ראש הממשלה",
    imageUrl: "https://drive.google.com/thumbnail?id=17Pc5bPtBPYe0_R32BSkoLGzgN7Xjih_Y&sz=w400",
    aliases: ["ביבי", "נתניהו", "בנימין ביבי נתניהו"]
  },
  {
    id: 2,
    name: "יריב לוין",
    party: "הליכוד",
    position: "סגן ראש הממשלה ושר המשפטים",
    imageUrl: "https://www.gov.il/BlobFolder/roleholder/minister_levin/he/levin.jpg", 
    aliases: ["לוין"]
  },
  {
    id: 3,
    name: "אמיר אוחנה",
    party: "הליכוד",
    position: "יו״ר הכנסת",
    imageUrl: "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/ohana/he/ohana.jpg",
    aliases: ["אוחנה"]
  },
  {
    id: 4,
    name: "ניר ברקת",
    party: "הליכוד",
    position: "שר הכלכלה",
    imageUrl: "https://www.gov.il/BlobFolder/roleholder/minister_barkat/he/barket.jpg",
    aliases: ["ברקת"]
  },
  {
    id: 5,
    name: "אבי דיכטר",
    party: "הליכוד",
    position: "שר החקלאות",
    imageUrl: "https://www.gov.il/BlobFolder/roleholder/minister_dichter/he/dichter.jpg",
    aliases: ["דיכטר"]
  },
  {
    id: 6,
    name: "ישראל כץ",
    party: "הליכוד",
    position: "שר החוץ",
    imageUrl: "https://www.gov.il/BlobFolder/roleholder/minister_katz_israel/he/katz.jpg",
    aliases: ["כץ", "ישראל כץ"]
  },
  {
    id: 7,
    name: "יואב גלנט",
    party: "הליכוד",
    position: "שר הביטחון",
    imageUrl: "https://www.gov.il/BlobFolder/roleholder/minister_gallant/he/gallant.jpg",
    aliases: ["גלנט"]
  },
  {
    id: 8,
    name: "אביגדור ליברמן",
    party: "ישראל ביתנו",
    position: "יו״ר האופוזיציה",
    imageUrl: "https://www.knesset.gov.il/mk/images/members/liberman_avigdor-s.jpg",
    aliases: ["ליברמן", "איווט"]
  },
  {
    id: 9,
    name: "יאיר לפיד",
    party: "יש עתיד",
    position: "ראש האופוזיציה",
    imageUrl: "https://www.knesset.gov.il/mk/images/members/lapid_yair-s.jpg",
    aliases: ["לפיד"]
  },
  {
    id: 10,
    name: "בני גנץ",
    party: "כחול לבן",
    position: "ח״כ",
    imageUrl: "https://www.knesset.gov.il/mk/images/members/gantz_benny-s.jpg",
    aliases: ["גנץ"]
  }
];