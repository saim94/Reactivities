using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Security
{
    public class CodeValidation
    {
        private readonly HttpClient _httpClient;
        private readonly Encryption _encryption;
        private readonly string _upstashUrl;
        private readonly string _upstashToken;

        public CodeValidation(HttpClient httpClient, IConfiguration configuration, Encryption encryption)
        {
            _httpClient = httpClient;
            _encryption = encryption;
            _upstashUrl = configuration["UPSTASH_REDIS_REST_URL"];
            _upstashToken = configuration["UPSTASH_REDIS_REST_TOKEN"];

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _upstashToken);
        }

        public async Task SetValidationCodeAsync(string email, string code, int expirationSeconds = 300)
        {
            var encryptedkey = _encryption.GenerateDeterministicKey($"user:{email}:code");
            var encryptedValue = _encryption.EncryptValue(code);
            var jsonContent = JsonSerializer.Serialize(new object[]
            {
                "SET",
                encryptedkey,
                encryptedValue,
                "EX",
                expirationSeconds
            });

            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.PostAsync(_upstashUrl, content);
                response.EnsureSuccessStatusCode();
            }
            catch (Exception e)
            {
                throw new Exception("Failed to set validation code in Redis.", e);
            }
        }

        public async Task<bool> ValidateCodeAsync(string email, string code)
        {
            var encryptedkey = _encryption.GenerateDeterministicKey($"user:{email}:code");
            var jsonContent = JsonSerializer.Serialize(new object[]
            {
                "GET",
                encryptedkey
            });

            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.PostAsync(_upstashUrl, content);
                response.EnsureSuccessStatusCode();

                var responseBody = await response.Content.ReadAsStringAsync();

                // Deserialize the response as a JSON object with a "result" property
                var jsonResponse = JsonSerializer.Deserialize<Dictionary<string, string>>(responseBody);

                // Check if result is null or contains the expected code
                if (jsonResponse != null && jsonResponse.TryGetValue("result", out var storedCode) && _encryption.Decrypt(storedCode) == code)
                {
                    // Optionally delete the code after successful validation
                    await DeleteCodeAsync(email);
                    return true;
                }

                return false;
            }
            catch (Exception e)
            {
                throw new Exception("Failed to validate code in Redis.", e);
            }
        }

        private async Task DeleteCodeAsync(string email)
        {
            var encryptedkey = _encryption.GenerateDeterministicKey($"user:{email}:code");
            var jsonContent = JsonSerializer.Serialize(new object[]
            {
                "DEL",
                encryptedkey
            });

            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.PostAsync(_upstashUrl, content);
                response.EnsureSuccessStatusCode();
            }
            catch (Exception e)
            {
                throw new Exception("Failed to delete validation code in Redis.", e);
            }
        }
    }
}
