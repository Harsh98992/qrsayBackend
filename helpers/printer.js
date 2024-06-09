const escpos = require("escpos");
// install escpos-usb adapter module manually
escpos.USB = require("escpos-usb");
// Select the adapter based on your printer type
const device = new escpos.USB();
// const device  = new escpos.Network('localhost');
// const device  = new escpos.Serial('/dev/usb/lp0');

// encoding is optional

const printer = new escpos.Printer(device);

device.open(function (error) {
  printer
    .font("a")
    .align("ct")

    .size(0.5, 0.5)
    .text("GREEN PALM")
    .text(
      "GROUND FLOOR, PLOT NO-1, HOTEL GREEN PALM, PACIFIC MALL, SITE-IV, SHAHIBABAD INDUSTRIAL AREA, ,GHAZIABAD,UTTAR PRADESH,201011"
    )
    .text("GST Number:- 09ABTFS9416Q1ZW")
    .text("Take Away")
    .text("Take Away :- ASAP");

  printer.marginBottom(10);
  printer.align("LT");
  printer.tableCustom([
    { text: "Jun 9, 2024", align: "LEFT" },
    { text: "1:51:09 PM", align: "RIGHT" },
  ]);

  printer.align("LT");
  printer.text("Order ID: 3262");
  printer.text("Payment Status: : Paid via wallet");
  printer.text("Quamar Larson");
  printer.text("9910072742 -");

  printer
    .marginBottom(10)
    .drawLine()
    .table(["Items", "Price", "Qty", "Amount"])
    .drawLine()
    .tableCustom(
      [
        { text: "COMBO 06", align: "LEFT" },
        { text: "399", align: "LEFT" },
        { text: "1", align: "LEFT" },
        { text: "399", align: "LEFT" },
      
      ],
      { encoding: "cp857", size: [1, 1] } // Optional
    )
    .tableCustom(
      [
        { text: "COMBO 06", align: "CENTER" },
        { text: "399", align: "CENTER" },
        { text: "1", align: "CENTER" },
        { text: "399", align: "CENTER" },
      
      ],
      { encoding: "cp857", size: [1, 1] } // Optional
    );

  printer.drawLine();
  //printer.alignLeft();
  printer.text("Total Quantity: 2");
  printer.tableCustom([
    { text: "Net Amt. ", align: "LEFT" },
    { text: "798", align: "RIGHT" },
  ]);
  printer.tableCustom([
    { text: "Tax (12%) ", align: "LEFT" },
    { text: "96", align: "RIGHT" },
  ]);
  printer.tableCustom([
    { text: "Total Amt", align: "LEFT" },
    { text: "894", align: "RIGHT" },
  ]);
  printer.drawLine();
  printer.println("Tax Summary");
 
  printer
    .drawLine()
    .table(["Tax (12%)", "Basic Amt", "Tax Amt"])
    .drawLine()
    .tableCustom(
      [
        { text: "CGST (6%) ", align: "LEFT" },
        { text: "798", align: "LEFT" },
        { text: "46", align: "LEFT" },
       
      ],
      { encoding: "cp857", size: [1, 1] } // Optional
    )
    .tableCustom(
      [
        { text: "CGST (6%) ", align: "LEFT" },
        { text: "798", align: "LEFT" },
        { text: "46", align: "LEFT" },
       
      ],
      { encoding: "cp857", size: [1, 1] } // Optional
    ).drawLine()
    .align("ct")
    .size(1,1)
    .text("Payable Amt.: 894")
    .size(0.5, 0.5)
    .text('Thanks for your visit !!!')
    .text('Have a good day')
  printer.cut();
  printer.close();
});
