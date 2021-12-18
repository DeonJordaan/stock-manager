class Product {
	constructor(
		public product: string,
		public description: string,
		public price?: number,
		public quantity?: number,
		public averagePrice?: number, //maybe not include this hereand only as a method SOMEWHERE?
		public prices?: []
	) {}
}

// Get average cost of product
// function getAveragePrice(product: Product) {
// 	let numElements = product.prices.length;
// 	let sumOfPrices = product.prices.reduce(function (sum, price) {
// 		return sum + price;
// 	}, 0);
// 	return sumOfPrices / numElements;
// }

// autobind Decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
	const originalMethod = descriptor.value;
	const adjustedDescriptor: PropertyDescriptor = {
		configurable: true,
		get() {
			const boundFunction = originalMethod.bind(this);
			return boundFunction;
		},
	};
	return adjustedDescriptor;
}

//ProductInput Class
class ProductInput {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLFormElement;
	productInputElement: HTMLInputElement;
	descriptionInputElement: HTMLInputElement;

	constructor() {
		this.templateElement = document.getElementById(
			'product-input'
		)! as HTMLTemplateElement;
		this.hostElement = document.getElementById('app')! as HTMLDivElement;

		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.element = importedNode.firstElementChild as HTMLFormElement;

		this.productInputElement = this.element.querySelector(
			'#product'
		) as HTMLInputElement;
		this.descriptionInputElement = this.element.querySelector(
			'#description'
		) as HTMLInputElement;

		this.configure();
		this.attach();
	}

	private gatherProductInfo(): [string, string] | void {
		const enteredProduct = this.productInputElement.value;
		const enteredDescription = this.descriptionInputElement.value;

		if (
			enteredProduct.trim().length === 0 ||
			enteredDescription.trim().length === 0
		) {
			alert('Invalid Input - Please Try Again!');
			return;
		} else {
			return [enteredProduct, enteredDescription];
		}
	}

	private clearInputs() {
		this.productInputElement.value = '';
		this.descriptionInputElement.value = '';
	}

	@autobind
	private submitHandler(event: Event) {
		event.preventDefault();
		const productInput = this.gatherProductInfo();
		if (Array.isArray(productInput)) {
			const [product, description] = productInput;

			const newProduct = new Product(product, description);

			fetch(
				'https://stock-manager-fa27c-default-rtdb.europe-west1.firebasedatabase.app/products.json',
				{
					method: 'POST',
					body: JSON.stringify(newProduct),
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
			this.clearInputs();
		}
	}

	private configure() {
		this.element.addEventListener('submit', this.submitHandler);
	}

	private attach() {
		this.hostElement.insertAdjacentElement('afterbegin', this.element);
	}
}

const productInput = new ProductInput();
