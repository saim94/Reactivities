//using FirebaseAdmin;
//using FirebaseAdmin.Auth;
//using Google.Apis.Auth.OAuth2;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace Infrastructure
//{
//    public class FirebaseService
//    {
//        public static void InitializeFirebase()
//        {
//            // Dynamically resolve the path relative to the current assembly location
//            var basePath = AppDomain.CurrentDomain.BaseDirectory; // Base path of the current running app
//            var fullPath = Path.Combine(basePath, "Keys", "serviceAccountKey.json");

//            if (!File.Exists(fullPath))
//            {
//                throw new FileNotFoundException("Firebase service account key file not found.", fullPath);
//            }

//            FirebaseApp.Create(new AppOptions
//            {
//                Credential = GoogleCredential.FromFile(fullPath)
//            });
//        }

//        public async Task<string> SendVerificationCode(string phoneNumber)
//        {
//            var phoneAuthProvider = FirebaseAuth.DefaultInstance;
//            FirebaseAuth.DefaultInstance.
//            var sessionInfo = await FirebaseAuth.DefaultInstance
//                .SendVerificationCodeAsync(phoneNumber, new SendVerificationCodeRequest
//                {
//                    PhoneNumber = phoneNumber,
//                    RecaptchaToken = "dummy-token-for-server",
//                    SessionInfo = true
//                });

//            return sessionInfo;
//        }

//        public async Task<bool> VerifyCode(string sessionInfo, string code)
//        {
//            try
//            {
//                var authResponse = await FirebaseAuth.DefaultInstance
//                    .VerifyCodeAsync(sessionInfo, code);

//                return authResponse.IsSuccess;
//            }
//            catch (Exception ex)
//            {
//                Console.WriteLine($"Error verifying code: {ex.Message}");
//                return false;
//            }
//        }

//    }
//}
