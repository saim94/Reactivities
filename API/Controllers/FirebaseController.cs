using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class FirebaseController : BaseApiController
    {
        private readonly IConfiguration _config;

        public FirebaseController(IConfiguration config)
        {
            _config = config;
        }

        [HttpGet("getFirebaseConfig")]
        public async Task<ActionResult> GetFirebaseConfig()
        {
            var firebaseConfig = new
            {
                ApiKey = _config["FIREBASE_API_KEY"],
                AuthDomain = _config["FIREBASE_AUTH_DOMAIN"],
                ProjectId = _config["FIREBASE_PROJECT_ID"],
                StorageBucket = _config["FIREBASE_STORAGE_BUCKET"],
                MessagingSenderId = _config["FIREBASE_MESSAGING_SENDER_ID"],
                AppId = _config["FIREBASE_APP_ID"]
            };

            return Ok(firebaseConfig);
        }
    }
}
