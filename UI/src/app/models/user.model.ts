export interface User {
  ID: number;
  FirstName: string;
  MiddleName?: string;
  LastName: string;
  UserName: string;
  Password: string;
  UserType: string;
  Gender?: string;
  DOB?: string; // DateTime as ISO string
  Age?: number;
  LastLoginDate?: string; // DateTime as ISO string
}
export interface UserLogin {
  UserName: string;
  Password: string;
}
