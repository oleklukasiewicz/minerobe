using Newtonsoft.Json;

namespace minerobe.api.Helpers
{
    public static class TypeExtension
    {
        public static string ToFirstCapitalLetter(this string str)
        {
            if (string.IsNullOrEmpty(str))
                return str;
            return char.ToUpper(str[0]) + str.Substring(1).ToLower();
        }
        public static T ToClass<T>(this object obj)
        {
            var serialized = JsonConvert.SerializeObject(obj);
            return JsonConvert.DeserializeObject<T>(serialized);
        }
    }
}
