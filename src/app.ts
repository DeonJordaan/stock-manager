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

// NOTE Validation Logic
interface Validatable {
	value: string | number;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
}

function validate(validatableInput: Validatable) {
	let isValid = true;
	if (validatableInput.required) {
		isValid =
			isValid && validatableInput.value.toString().trim().length !== 0;
	}
	if (
		validatableInput.minLength != null &&
		typeof validatableInput.value === 'string'
	) {
		isValid =
			isValid &&
			validatableInput.value.length >= validatableInput.minLength;
	}
	if (
		validatableInput.maxLength != null &&
		typeof validatableInput.value === 'string'
	) {
		isValid =
			isValid &&
			validatableInput.value.length <= validatableInput.maxLength;
	}
	if (
		validatableInput.min != null &&
		typeof validatableInput.value === 'number'
	) {
		isValid = isValid && validatableInput.value >= validatableInput.min;
	}
	if (
		validatableInput.max != null &&
		typeof validatableInput.value === 'number'
	) {
		isValid = isValid && validatableInput.value <= validatableInput.max;
	}
	return isValid;
}

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

// StockItem Class
class StockItem {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLUListElement;
	element: HTMLLIElement;

	private product: Product | undefined;

	constructor(product: string, description: string, avgPrice: number) {
		this.templateElement = document.getElementById(
			'stock-item'
		)! as HTMLTemplateElement;
		this.hostElement = document.querySelector('ul')! as HTMLUListElement;

		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.element = importedNode.firstElementChild as HTMLLIElement;
		if (this.product) {
			this.product.product = product;
			this.product.description = description;
			this.product.averagePrice = avgPrice;
		}
		this.attach();
	}

	private attach() {
		this.hostElement.insertAdjacentElement('beforeend', this.element);
	}

	renderContent() {
		this.element.querySelector('#product__01--label')!.textContent =
			this.product?.product;
		this.element.querySelector('#product__01--average-price')!.textContent =
			this.product.averagePrice;
		this.element.querySelector('#product__01--quantity')!.textContent =
			this.product.quantity;
	}
}

// StockList Class
class StockList {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLElement;

	stockItems: Product[] | undefined;

	constructor() {
		this.templateElement = document.getElementById(
			'stock-levels'
		)! as HTMLTemplateElement;
		this.hostElement = document.getElementById('app')! as HTMLDivElement;

		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.element = importedNode.firstElementChild as HTMLElement;
		this.attach();

		const response = await fetch(
			'https://stock-manager-fa27c-default-rtdb.europe-west1.firebasedatabase.app/products.json'
		);
		if (!response.ok) {
			throw new Error('Oops! Cannot find the products!');
		}

		const data = await response.json();

		const products = [];

		for (const key in data) {
			products.push({
				product: data[key].product,
				description: data[key].description,
				price: data[key].price,
			});
		}
		this.stockItems = products;
		this.renderStockList();
	}

	private attach() {
		this.hostElement.insertAdjacentElement('beforeend', this.element);
	}

	private renderStockList() {
		const listEl = document.getElementById(
			'stock-list'
		)! as HTMLUListElement;
		listEl.innerHTML = '';
		for (const product of this.stockItems) {
			new StockItem();
		}
	}
}

//ProductInput Class
class ProductInput {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLFormElement;
	productInputElement: HTMLInputElement;
	descriptionInputElement: HTMLInputElement;
	priceInputElement: HTMLInputElement;

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
		this.priceInputElement = this.element.querySelector(
			'#price'
		) as HTMLInputElement;

		this.configure();
		this.attach();
	}

	private gatherProductInfo(): [string, string, number] | void {
		const enteredProduct = this.productInputElement.value;
		const enteredDescription = this.descriptionInputElement.value;
		const enteredPrice = +this.priceInputElement.value;

		const productValidatable: Validatable = {
			value: enteredProduct,
			required: true,
		};
		const descriptionValidatable: Validatable = {
			value: enteredDescription,
			required: true,
			minLength: 5,
		};
		const priceValidatable: Validatable = {
			value: enteredPrice,
			required: false,
			min: 0.01,
		};

		if (
			!validate(productValidatable) &&
			!validate(descriptionValidatable) &&
			!validate(priceValidatable)
		) {
			alert('Invalid Input - Please Try Again!');
			return;
		} else {
			return [enteredProduct, enteredDescription, enteredPrice];
		}
	}

	private clearInputs() {
		this.productInputElement.value = '';
		this.descriptionInputElement.value = '';
		this.priceInputElement.value = '';
	}

	@autobind
	private submitHandler(event: Event) {
		event.preventDefault();
		const productInput = this.gatherProductInfo();
		if (Array.isArray(productInput)) {
			const [product, description, price] = productInput;

			const newProduct = new Product(product, description, price);

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
const stockList = new StockList();
