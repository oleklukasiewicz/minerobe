using Newtonsoft.Json;
using System.Reflection;

namespace minerobe.api.Helpers
{
    public static class TypeExtension
    {
        public static string ToFirstCapitalLetter(this string str, bool preserveOldCapitals = true)
        {
            if (string.IsNullOrEmpty(str))
                return str;
            return char.ToUpper(str[0]) + (preserveOldCapitals ? str.Substring(1) : str.Substring(1).ToLower());
        }
        public static T ToClass<T>(this object obj)
        {
            var serialized = JsonConvert.SerializeObject(obj);
            return JsonConvert.DeserializeObject<T>(serialized);
        }
        public static bool HasIdProperty<T>()
        {
            return typeof(T).GetProperty("Id", BindingFlags.Public | BindingFlags.Instance) != null;
        }
    }
}
