using Microsoft.JSInterop;
using System.ComponentModel;
using System.Text.Json;

namespace StrichInterop
{
	public class StrichInterop : IAsyncDisposable
	{
		private Lazy<Task<IJSObjectReference>> moduleTask;

        private static readonly JsonSerializerOptions SerializerOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = null,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
            Converters = {
                //new PolymorphicConverter<ITrace>(),
                //new PolymorphicConverter<ITransform>(),
                //new DateTimeConverter(),
                //new DateTimeOffsetConverter()
            }
        };

        public static JsonSerializerOptions SerializerOptions1 => SerializerOptions;

        public StrichInterop(IJSRuntime jsRuntime)
		{
            moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/BlazorStrich/StrichInterop.js").AsTask());            
        }

        public async Task initStrich(IJSRuntime jsRuntime)
        {
			var module = await moduleTask.Value;
			await module.InvokeVoidAsync("initializeSDK");			
		}

        public async Task runStrich(IJSRuntime jsRuntime,BarcodeString ReadBarcode)
		{
			var module = await moduleTask.Value;
			await module.InvokeVoidAsync("startBarcodeScan", DotNetObjectReference.Create(ReadBarcode));
		}        

        public async ValueTask DebugMessage(string mess)
		{
			var module = await moduleTask.Value;
            await module.InvokeVoidAsync("DisplayMessage", mess);            
        }

		public async ValueTask DisposeAsync()
		{			
			try
			{
				if (moduleTask.IsValueCreated)
				{
					var module = await moduleTask.Value;					
					await module.DisposeAsync();
				}                
            }
			catch (JSDisconnectedException ex)
			{
				// Ignore
				await DebugMessage(ex.Message);
			}
		}

	}

	public class BarcodeString
	{
		private string scanresult;        
        public string ScanResult
		{
			get => scanresult;
			set => scanresult = value;
		}
        [JSInvokable]
		public void UpdateCodeAsync(string newValue)
		{
			scanresult = newValue;			
		}        
    }
}
