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
    }
}
