/*
 * constants.tsx
 * File containing keys and urls for wallet demo
 * 
 * Authors:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * Created at: January 20th 2024
 * -----
 * Last Modified: January 20th 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */

// User Data Token is in JWT Format which contains User Personal Data
// In this example, User Data is user's Personal Bank Information
export const USER_DATA_TOKEN = 'eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20venVsYW1kYXQvenVsYW1kYXQuZ2l0aHViLmlvL3NhbXBsZS1rZXkvemtwLWtleS9pc3N1ZXIta2V5Lmpzb24iLCJraWQiOiJrLTEiLCJhbGciOiJFUzI1NiJ9.eyJkYXRhIjp7ImJjYURvY0lEIjoiRE9DODk3OTIzQ1AiLCJiY2FEb2NOYW1lIjoiQkNBIEN1c3RvbWVyIFByb2ZpbGUiLCJjdXN0b21lcklEIjoiQkNBMTIzNzU2MTA4IiwicGVyc29uYWxJbmZvIjp7ImZpcnN0TmFtZSI6IkRld2kiLCJsYXN0TmFtZSI6IlB1dHJpIiwiZGF0ZU9mQmlydGgiOiIxOTgwLTAxLTAxIiwiZHJpdmVyTGljZW5zZU51bWJlciI6IkRMMTIzNDU2Nzg5In0sImZpbmFuY2lhbEluZm8iOnsiYXZlcmFnZU1vbnRobHlCYWxhbmNlIjoyMDAwMDAwMDAsImNyZWRpdFJhdGluZ3MiOnsicGVmaW5kbyI6NzIwLCJjcmVkaXRLYXJtYSI6NzI1LCJlcXVpSW5mbyI6NzMwfSwiYWNjb3VudHMiOnsiY2hlY2tpbmciOnsiYWNjb3VudE51bWJlciI6IkNISzEyMzQ1NjciLCJiYWxhbmNlIjo1MDAwMDAwMH0sInNhdmluZ3MiOnsiYWNjb3VudE51bWJlciI6IlNBVjEyMzQ1NjciLCJiYWxhbmNlIjoxNTAwMDAwMDB9fX0sImxvYW5IaXN0b3J5IjpbeyJsb2FuVHlwZSI6ImF1dG8iLCJsb2FuQW1vdW50IjoyMDAwMDAwMDAsImxvYW5TdGF0dXMiOiJjbG9zZWQifV0sImNvbnRhY3RJbmZvIjp7ImVtYWlsIjoiZGV3aS5wdXRyaUB5YWhvby5jb20iLCJwaG9uZSI6Iis2Mi04NTUtMTIzLTQ1NjcifSwiZmxhZ3MiOnsiaXNPdmVyZHJhZnRQcm90ZWN0ZWQiOnRydWUsImlzVklQIjpmYWxzZSwiZnJhdWRBbGVydHMiOmZhbHNlfX19.63naWQ6I3Yg4WFzuiUneYQ85leg5scPDK_CMzQUuAYk2PjlNaJ8Hujp7uk0ml8qf9lSUI2YOgL0iwu8AL_D6hg';

// DVR Token is in JWT Format which contains Query for the User Data
// In this example, The query is to check:
// 1. BCA Doc ID
// 2. User's First and Last Name
// 3. Driver License Number
// 4. Credit Rating >= 650
// 5. Account Savings Balance >= 30000000
export const DVR_TOKEN = 'eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20venVsYW1kYXQvenVsYW1kYXQuZ2l0aHViLmlvL3NhbXBsZS1rZXkvemtwLWtleS92ZXJpZmllci1rZXkuanNvbiIsImtpZCI6ImstMSIsImFsZyI6IkVTMjU2In0.eyJkYXRhIjp7ImR2cl90aXRsZSI6Ik15IERWUiIsImR2cl9pZCI6IjE1ZmQ0MzA0LWNlYzAtNDZjNC04NWI3LWY5ZDhkNWRhZWUxYSIsInF1ZXJ5X2VuZ2luZV92ZXIiOiIwLjEuMCIsInF1ZXJ5X21ldGhvZF92ZXIiOiJhNzg4YzY4NmJmNzdiOWNlYWZjZjgxYjVmMzk2MjVmYmZhOWY3YTdhMjY1OGE4YjhhMTM0YjY4MzljZDkyY2Y1IiwicXVlcnkiOiJ7XCJhbmRcIjpbe1wiPT1cIjpbXCJiY2FEb2NJRFwiLFwiRE9DODk3OTIzQ1BcIl19LHtcIn49PVwiOltcInBlcnNvbmFsSW5mby5maXJzdE5hbWVcIixcIkRld2lcIl19LHtcIn49PVwiOltcInBlcnNvbmFsSW5mby5sYXN0TmFtZVwiLFwiUHV0cmlcIl19LHtcIn49PVwiOltcInBlcnNvbmFsSW5mby5kcml2ZXJMaWNlbnNlTnVtYmVyXCIsXCJETDEyMzQ1Njc4OVwiXX0se1wiPj1cIjpbXCJmaW5hbmNpYWxJbmZvLmNyZWRpdFJhdGluZ3MucGVmaW5kb1wiLDY1MF19LHtcIj49XCI6W1wiZmluYW5jaWFsSW5mby5hY2NvdW50cy5zYXZpbmdzLmJhbGFuY2VcIiwzMDAwMDAwMF19XX0iLCJ1c2VyX2RhdGFfdXJsIjoiaHR0cHM6Ly94eXouY29tIiwidXNlcl9kYXRhX3ZlcmlmeWluZ19rZXkiOnsiS2V5c2V0RW5kcG9pbnQiOnsiamt1IjoiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3p1bGFtZGF0L3p1bGFtZGF0LmdpdGh1Yi5pby9zYW1wbGUta2V5L3prcC1rZXkvaXNzdWVyLWtleS5qc29uIiwia2lkIjoiay0xIn19LCJkdnJfdmVyaWZpeWluZ19rZXkiOnsiUHVibGljS2V5Ijp7IngiOiJNRmt3RXdZSEtvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUVwNldKbHdBdGxkL1U0aERtbXV1TWRaQ1Z0TWVVIiwieSI6IklUM3hrRGRVd0xPdnNWVkEraWlTd2ZhWDRIcUtsUlBER0crRjZXR2pueHlzOVQ1R3ROZTNudmV3T0E9PSJ9fX19.0Qwtfxef01KLmK4ms99C4CrPR51Mxrp5Q5l6A3HxwNsG44MdwR5xBNlA8_SONvdsVlYW-uYcvBCxNJg2k-6sEA';

export const ZKPASS_URL = 'https://staging-zkpass.ssi.id/proof';
export const ZKPASS_API_KEY = 'e7fd7ec9-33b2-4f33-a383-c2f1d151a7c2';
export const ZKPASS_API_SECRET = '6a79ffa2-5fe8-4764-8edf-0ebc5dbcccf9';